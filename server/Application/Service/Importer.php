<?php

declare(strict_types=1);

namespace Application\Service;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionLineRepository;
use Application\Repository\UserRepository;
use Cake\Chronos\Chronos;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\ExceptionWithoutMailLogging;
use Ecodev\Felix\Service\Bvr;
use Genkgo\Camt\Camt054\MessageFormat\V02;
use Genkgo\Camt\Camt054\MessageFormat\V04;
use Genkgo\Camt\Config;
use Genkgo\Camt\DTO\Address;
use Genkgo\Camt\DTO\Entry;
use Genkgo\Camt\DTO\EntryTransactionDetail;
use Genkgo\Camt\DTO\Message;
use Genkgo\Camt\DTO\Record;
use Genkgo\Camt\DTO\RelatedPartyTypeInterface;
use Genkgo\Camt\Exception\ReaderException;
use Genkgo\Camt\Reader;

/**
 * This service allows to import a CAMT file as Transaction and TransactionLine
 *
 * @see https://www.six-group.com/interbank-clearing/dam/downloads/en/standardization/iso/swiss-recommendations/archives/implementation-guidelines-cm/standardization_isopayments_iso_20022_ch_implementation_guidelines_camt.pdf
 */
class Importer
{
    /**
     * @var Message
     */
    private $message;

    /**
     * @var Transaction[]
     */
    private $transactions = [];

    /**
     * @var Account
     */
    private $bankAccount;

    /**
     * @var AccountRepository
     */
    private $accountRepository;

    /**
     * @var UserRepository
     */
    private $userRepository;

    private TransactionLineRepository $transactionLineRepository;

    public function __construct()
    {
        $this->accountRepository = _em()->getRepository(Account::class);
        $this->userRepository = _em()->getRepository(User::class);
        $this->transactionLineRepository = _em()->getRepository(TransactionLine::class);
    }

    /**
     * Import all transactions from a CAMT file
     *
     * @return Transaction[]
     */
    public function import(string $file): array
    {
        $this->transactions = [];
        $reader = new Reader(Config::getDefault());

        try {
            $this->message = $reader->readFile($file);
        } catch (ReaderException $exception) {
            throw new Exception($exception->getMessage(), 0, $exception);
        }

        $this->validateFormat($reader);

        $this->userRepository->getAclFilter()->runWithoutAcl(function (): void {
            $records = $this->message->getRecords();
            foreach ($records as $record) {
                $this->bankAccount = $this->loadAccount($record);

                foreach ($record->getEntries() as $entry) {
                    $this->importTransaction($entry);
                }
            }
        });

        return $this->transactions;
    }

    private function validateFormat(Reader $reader): void
    {
        $messageFormat = $reader->getMessageFormat();
        if (!$messageFormat) {
            // This should actually never happen, because the reader would throw an exception before here
            throw new Exception('Unknown XML format');
        }

        $expected = [
            V02::class,
            V04::class,
        ];

        if (!in_array(get_class($messageFormat), $expected, true)) {
            throw new Exception('The format CAMT 054 is expected, but instead we got: ' . $messageFormat->getMsgId());
        }
    }

    private function importTransaction(Entry $entry): void
    {
        $nativeDate = $entry->getValueDate();
        $date = Chronos::instance($nativeDate);

        $transaction = new Transaction();
        $transaction->setName('Versement BVR');
        $transaction->setTransactionDate($date);

        $internalRemarks = [];
        foreach ($entry->getTransactionDetails() as $detail) {
            $internalRemarks[] = $this->importTransactionLine($transaction, $detail);

            // Use same owner for line and transaction
            $transaction->setOwner($transaction->getTransactionLines()->first()->getOwner());
        }
        $transaction->setInternalRemarks(implode(PHP_EOL . PHP_EOL, $internalRemarks));

        // Don't persist transaction that may not have any lines
        if ($transaction->getTransactionLines()->count()) {
            _em()->persist($transaction);
            $this->transactions[] = $transaction;
        }
    }

    private function importTransactionLine(Transaction $transaction, EntryTransactionDetail $detail): string
    {
        $referenceNumber = $detail->getRemittanceInformation()->getStructuredBlock()->getCreditorReferenceInformation()->getRef();
        $user = $this->loadUser($referenceNumber);
        $userAccount = $this->accountRepository->getOrCreate($user);
        $remarks = $this->getRemarks($detail, $referenceNumber);
        $amount = $detail->getAmount();
        $endToEndId = $this->getEndToEndId($detail);

        $line = new TransactionLine();
        $line->setTransaction($transaction);
        $line->setOwner($user);
        $line->setName('Versement BVR');
        $line->setTransactionDate($transaction->getTransactionDate());
        $line->setBalance($amount);
        $line->setCredit($userAccount);
        $line->setDebit($this->bankAccount);
        $line->setImportedId($endToEndId);

        _em()->persist($line);

        return $remarks;
    }

    private function partyToString(RelatedPartyTypeInterface $party): string
    {
        $parts = [];
        $parts[] = $this->partyLabel($party);
        $parts[] = $party->getName();

        $address = $party->getAddress();
        if ($address) {
            $parts[] = $this->addressToString($address);
        }

        return implode(PHP_EOL, $parts);
    }

    private function partyLabel(RelatedPartyTypeInterface $party): string
    {
        $class = get_class($party);
        switch ($class) {
            case \Genkgo\Camt\DTO\Recipient::class:
                return 'Récipient';
            case \Genkgo\Camt\DTO\Debtor::class:
                return 'Débiteur';
            case \Genkgo\Camt\DTO\Creditor::class:
                return 'Créancier';
            case \Genkgo\Camt\DTO\UltimateDebtor::class:
                return 'Débiteur final';
            case \Genkgo\Camt\DTO\UltimateCreditor::class:
                return 'Créancier final';
            default:
                throw new Exception('Non supported related party type: ' . $class);
        }
    }

    private function addressToString(Address $a): string
    {
        $lines = [];
        $lines[] = trim($a->getStreetName() . ' ' . $a->getBuildingNumber());
        $lines[] = trim($a->getPostCode() . ' ' . $a->getTownName());
        $lines[] = $a->getCountry();
        $lines = array_merge($lines, $a->getAddressLines());

        $nonEmptyLines = array_filter($lines);

        return implode(PHP_EOL, $nonEmptyLines);
    }

    private function getRemarks(EntryTransactionDetail $detail, string $referenceNumber): string
    {
        $parts = [];
        $parts[] = 'Numéro de référence: ' . $referenceNumber;

        foreach ($detail->getRelatedParties() as $party) {
            $partyDetail = $party->getRelatedPartyType();
            $parts[] = $this->partyToString($partyDetail);
        }

        $remarks = implode(PHP_EOL . PHP_EOL, $parts);

        return $remarks;
    }

    private function loadAccount(Record $record): Account
    {
        $accountFromFile = $record->getAccount();
        $iban = $accountFromFile->getIdentification();
        $account = $this->accountRepository->findOneByIban($iban);

        if (!$account) {
            throw new Exception('The CAMT file contains a statement for account with IBAN `' . $iban . '`, but no account exist for that IBAN in the database. Either create/update a corresponding account, or import a different CAMT file.');
        }

        return $account;
    }

    private function loadUser(string $referenceNumber): User
    {
        $userId = (int) Bvr::extractCustomId($referenceNumber);
        $user = $this->userRepository->getOneById($userId);

        if (!$user) {
            throw new Exception('Could not find a matching user for reference number `' . $referenceNumber . '` and user ID `' . $userId . '`.');
        }

        return $user;
    }

    /**
     * This must return a non-empty universally unique identifier for one detail
     */
    private function getEndToEndId(EntryTransactionDetail $detail): string
    {
        $reference = $detail->getReference();

        $endToEndId = $reference->getEndToEndId();
        if (!$endToEndId || $endToEndId === 'NOTPROVIDED') {
            $endToEndId = $reference->getAccountServicerReference();
        }

        if (!$endToEndId) {
            throw new Exception('Cannot import a transaction without an end-to-end ID or an account servicer reference to store a universal identifier.');
        }

        if ($this->transactionLineRepository->importedIdExists($endToEndId)) {
            throw new ExceptionWithoutMailLogging('It looks like this file was already imported. A transaction line with the following `importedId` was already imported once and cannot be imported again: ' . $endToEndId);
        }

        return $endToEndId;
    }
}
