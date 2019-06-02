<?php

declare(strict_types=1);

namespace Application\Service;

use Application\Api\Exception;
use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\UserRepository;
use Cake\Chronos\Chronos;
use Genkgo\Camt\Config;
use Genkgo\Camt\DTO\Address;
use Genkgo\Camt\DTO\Entry;
use Genkgo\Camt\DTO\EntryTransactionDetail;
use Genkgo\Camt\DTO\Message;
use Genkgo\Camt\DTO\Record;
use Genkgo\Camt\DTO\RelatedPartyTypeInterface;
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

    public function __construct()
    {
        $this->accountRepository = _em()->getRepository(Account::class);
        $this->userRepository = _em()->getRepository(User::class);
    }

    /**
     * Import all transactions from a CAMT file
     *
     * @param string $file
     *
     * @return Transaction[]
     */
    public function import(string $file): array
    {
        $this->transactions = [];
        $reader = new Reader(Config::getDefault());
        $this->message = $reader->readFile($file);

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

    /**
     * @param Entry $entry
     */
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
        $amount = $detail->getAmount()->getAmount();

        $accountServicerReference = $detail->getReference()->getAccountServiceReference();
        if (!$accountServicerReference) {
            throw new Exception('Cannot import a transaction without a account servicer reference to store a universal identifier.');
        }

        $line = new TransactionLine();
        $line->setTransaction($transaction);
        $line->setOwner($user);
        $line->setName('Versement BVR');
        $line->setTransactionDate($transaction->getTransactionDate());
        $line->setBalance($amount);
        $line->setCredit($userAccount);
        $line->setDebit($this->bankAccount);
        $line->setImportedId($accountServicerReference);

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

    /**
     * @param EntryTransactionDetail $detail
     * @param string $referenceNumber
     *
     * @return string
     */
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

    /**
     * @param Record $record
     *
     * @return Account
     */
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

    /**
     * @param string $referenceNumber
     *
     * @return User
     */
    private function loadUser(string $referenceNumber): User
    {
        $userId = (int) Bvr::extractCustomId($referenceNumber);
        $user = $this->userRepository->getOneById($userId);

        if (!$user) {
            throw new Exception('Could not find a matching user for reference number `' . $referenceNumber . '`.');
        }

        return $user;
    }
}
