<?php

declare(strict_types=1);

namespace Application\Service;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionRepository;
use Application\Repository\UserRepository;
use Cake\Chronos\Chronos;
use Cake\Chronos\Date;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\ExceptionWithoutMailLogging;
use Ecodev\Felix\Format;
use Money\Money;
use Throwable;

/**
 * Service to process accounting tasks
 */
class Accounting
{
    private EntityManager $entityManager;

    private array $accountingConfig;

    private TransactionRepository $transactionRepository;

    private AccountRepository $accountRepository;

    private UserRepository $userRepository;

    private bool $hasError = false;

    private string $hostname;

    public function __construct(EntityManager $entityManager, array $accountingConfig, string $hostname)
    {
        $this->entityManager = $entityManager;
        $this->accountingConfig = $accountingConfig;
        $this->hostname = $hostname;

        $this->transactionRepository = $this->entityManager->getRepository(Transaction::class);
        $this->accountRepository = $this->entityManager->getRepository(Account::class);
        $this->userRepository = $this->entityManager->getRepository(User::class);
    }

    /**
     * Check and print various things about accounting.
     *
     * @return bool `true` if errors are found
     */
    public function check(): bool
    {
        // Update all accounts' balance from transactions
        $this->accountRepository->updateAccountsBalance();

        $this->checkAccounts();
        $this->checkTransactionsAreBalanced();
        $this->checkMissingAccountsForUsers();
        $this->checkUnnecessaryAccounts();
        $this->checkFamilyMembersShareSameAccount();

        return $this->hasError;
    }

    /**
     * Generate the closing entries at the end of an accounting period
     *
     * @param Date $endDate the end of fiscal period
     * @param null|array $output an optional array to output log
     *
     * @return null|Transaction the closing transaction or null if no entry written
     */
    public function close(Date $endDate, ?array &$output = null): ?Transaction
    {
        if ($endDate->isFuture()) {
            throw new ExceptionWithoutMailLogging('La date du bouclement ne peut pas être dans le futur');
        }
        $endDateTime = (new Chronos($endDate))->endOfDay();

        /** @var null|Account $closingAccount */
        $closingAccount = $this->accountRepository->findOneBy(['code' => $this->accountingConfig['closingAccountCode']]);
        if ($closingAccount === null) {
            throw new Exception('Could not find closing account, maybe it is missing in config or in accounts');
        }
        /** @var null|Account $carryForwardAccount */
        $carryForwardAccount = $this->accountRepository->findOneBy(['code' => $this->accountingConfig['carryForwardAccountCode']]);
        if ($carryForwardAccount === null) {
            throw new Exception('Could not find carry forward account, maybe it is missing in config or in accounts');
        }

        $allAccountsToClose = [
            'expenses' => $this->accountRepository->findBy(['type' => AccountTypeType::EXPENSE]),
            'revenues' => $this->accountRepository->findBy(['type' => AccountTypeType::REVENUE]),
        ];

        if (is_array($output)) {
            $output[] = 'Bouclement au ' . $endDate->toDateString();
        }

        $existingClosingTransaction = $this->transactionRepository->findOneBy(['name' => 'Bouclement', 'transactionDate' => $endDateTime]);

        if ($existingClosingTransaction) {
            throw new ExceptionWithoutMailLogging('Le bouclement a déjà été fait au ' . $endDateTime->toDateTimeString());
        }

        $closingTransaction = new Transaction();
        $closingTransaction->setTransactionDate($endDateTime);
        $closingTransaction->setInternalRemarks('Écriture générée automatiquement');
        $closingTransaction->setName('Bouclement');

        $this->generateClosingEntries($allAccountsToClose, $closingTransaction, $closingAccount, $endDate);

        $profitOrLoss = $closingAccount->getBalance();
        if ($profitOrLoss->isZero()) {
            if (count($closingTransaction->getTransactionLines())) {
                if (is_array($output)) {
                    $output[] = 'Résultat équilibré, ni bénéfice, ni déficit: rien à reporter';
                }
                _em()->flush();

                return $closingTransaction;
            }
            if (is_array($output)) {
                $output[] = 'Aucun mouvement ou solde des comptes nul depuis le dernier bouclement: rien à reporter';
            }

            return null;
        }
        $carryForward = new TransactionLine();
        _em()->persist($carryForward);
        $carryForward->setTransaction($closingTransaction);
        $carryForward->setBalance($profitOrLoss->absolute());
        $carryForward->setTransactionDate($closingTransaction->getTransactionDate());
        if ($profitOrLoss->isPositive()) {
            if (is_array($output)) {
                $output[] = 'Bénéfice : ' . Format::money($profitOrLoss);
            }
            $carryForward->setName('Report du bénéfice');
            $carryForward->setDebit($closingAccount);
            $carryForward->setCredit($carryForwardAccount);
        } elseif ($profitOrLoss->isNegative()) {
            if (is_array($output)) {
                $output[] = 'Déficit : ' . Format::money($profitOrLoss->absolute());
            }
            $carryForward->setName('Report du déficit');
            $carryForward->setDebit($carryForwardAccount);
            $carryForward->setCredit($closingAccount);
        }

        _em()->flush();

        return $closingTransaction;
    }

    private function generateClosingEntries(array $allAccountsToClose, Transaction $closingTransaction, Account $closingAccount, Date $endDate): void
    {
        $closingEntries = [];
        foreach ($allAccountsToClose as $accountType => $accountsToClose) {
            foreach ($accountsToClose as $account) {
                /** @var Money $balance */
                $balance = $account->getBalanceAtDate($endDate);
                if ($balance->isZero()) {
                    continue;
                }
                if ($account->getType() === AccountTypeType::EXPENSE && !in_array(mb_substr((string) $account->getCode(), 0, 1), ['4', '5', '6'], true)) {
                    throw new Exception('Account ' . $account->getCode() . ' has an invalid code for an expense account');
                }
                if ($account->getType() === AccountTypeType::REVENUE && mb_substr((string) $account->getCode(), 0, 1) !== '3') {
                    throw new Exception('Account ' . $account->getCode() . ' has an invalid code for a revenue account');
                }
                $entry = [
                    'transactionDate' => $closingTransaction->getTransactionDate(),
                    'name' => 'Bouclement ' . $account->getName(),
                    'balance' => $balance->absolute(),
                ];
                if ($account->getType() === AccountTypeType::EXPENSE) {
                    if ($balance->isPositive()) {
                        $entry['credit'] = $account;
                        $entry['debit'] = $closingAccount;
                    } else {
                        $entry['credit'] = $closingAccount;
                        $entry['debit'] = $account;
                    }
                } elseif ($account->getType() === AccountTypeType::REVENUE) {
                    if ($balance->isPositive()) {
                        $entry['credit'] = $closingAccount;
                        $entry['debit'] = $account;
                    } else {
                        $entry['credit'] = $account;
                        $entry['debit'] = $closingAccount;
                    }
                } else {
                    throw new Exception('I don\'t know how to close account ' . $account->getCode() . ' of type ' . $account->getType());
                }
                $closingEntries[] = $entry;
            }
        }
        if (count($closingEntries)) {
            $this->transactionRepository->hydrateLinesAndFlush($closingTransaction, $closingEntries);
        }
    }

    /**
     * Print the error message and remember that at least one error was found
     */
    private function error(string $message): void
    {
        if (!$this->hasError) {
            echo PHP_EOL;
        }

        echo $message . PHP_EOL;
        $this->hasError = true;
    }

    private function checkAccounts(): void
    {
        $assets = $this->accountRepository->totalBalanceByType(AccountTypeType::ASSET);
        $liabilities = $this->accountRepository->totalBalanceByType(AccountTypeType::LIABILITY);
        $revenue = $this->accountRepository->totalBalanceByType(AccountTypeType::REVENUE);
        $expense = $this->accountRepository->totalBalanceByType(AccountTypeType::EXPENSE);
        $equity = $this->accountRepository->totalBalanceByType(AccountTypeType::EQUITY);

        $income = $revenue->subtract($expense);

        $discrepancy = $assets->subtract($income)->subtract($liabilities->add($equity));

        echo '
Produits  : ' . Format::money($revenue) . '
Charges   : ' . Format::money($expense) . '
' . ($income->isNegative() ? 'Déficit   : ' : 'Bénéfice  : ') . Format::money($income) . '
Actifs    : ' . Format::money($assets) . '
Passifs   : ' . Format::money($liabilities) . '
Capital   : ' . Format::money($equity) . '
Écart     : ' . Format::money($discrepancy) . PHP_EOL;

        if (!$discrepancy->isZero()) {
            $this->error(sprintf('ERREUR: écart de %s au bilan des comptes', Format::money($discrepancy)));
        }
    }

    private function checkTransactionsAreBalanced(): void
    {
        $connection = _em()->getConnection();

        $sql = <<<STRING
             SELECT transaction_id,
                 SUM(IF(debit_id IS NOT NULL, balance, 0))  as totalDebit,
                 SUM(IF(credit_id IS NOT NULL, balance, 0)) as totalCredit
             FROM transaction_line
             GROUP BY transaction_id
             HAVING totalDebit <> totalCredit
            STRING;

        $result = $connection->executeQuery($sql);

        while ($row = $result->fetchAssociative()) {
            $msg = sprintf(
                'Transaction %s non-équilibrée, débits: %s, crédits: %s',
                $row['transaction_id'] ?? 'NEW',
                Format::money(Money::CHF($row['totalDebit'])),
                Format::money(Money::CHF($row['totalCredit'])),
            );
            $this->error($msg);
        }
    }

    private function checkMissingAccountsForUsers(): void
    {
        // Create missing accounts for users
        foreach ($this->userRepository->getAllFamilyOwners() as $user) {
            if (!empty($user->getLogin()) && !$user->getAccount()) {
                $account = $this->accountRepository->getOrCreate($user);
                echo sprintf('Création du compte %d pour l\'utilisateur %d...', $account->getCode(), $user->getId()) . PHP_EOL;
                _em()->flush();
            }
        }
    }

    private function checkUnnecessaryAccounts(): void
    {
        $deletedAccount = $this->accountRepository->deleteAccountOfNonFamilyOwnerWithoutAnyTransactions();
        if ($deletedAccount) {
            // Strictly speaking this is not an error, but we would like to be informed by email when it happens
            $this->error("$deletedAccount compte(s) été effacé parce qu'il appartenait à un utilisateur qui n'était pas chef de famille et que le compte avait aucune transaction");
        }
    }

    private function checkFamilyMembersShareSameAccount(): void
    {
        // Make sure users of the same family share the same account
        foreach ($this->userRepository->getAllNonFamilyOwnersWithAccount() as $user) {
            $this->error(
                sprintf(
                    'User#%d (%s) ne devrait pas avoir son propre compte débiteur mais partager celui du User#%d (%s)',
                    $user->getId(),
                    $user->getName(),
                    $user->getOwner()->getId(),
                    $user->getOwner()->getName()
                )
            );
        }
    }
}
