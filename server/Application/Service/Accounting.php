<?php

declare(strict_types=1);

namespace Application\Service;

use Application\Enum\AccountType;
use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionRepository;
use Application\Repository\UserRepository;
use Cake\Chronos\Chronos;
use Cake\Chronos\ChronosDate;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\ExceptionWithoutMailLogging;
use Ecodev\Felix\Format;
use Money\Money;

/**
 * Service to process accounting tasks.
 */
class Accounting
{
    private readonly TransactionRepository $transactionRepository;

    private readonly AccountRepository $accountRepository;

    private readonly UserRepository $userRepository;

    private bool $hasError = false;

    public function __construct(
        private readonly EntityManager $entityManager,
        private readonly array $accountingConfig,
    ) {
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
     * Generate the closing entries at the end of an accounting period.
     *
     * @param ChronosDate $endDate the end of fiscal period
     * @param null|array $output an optional array to output log
     *
     * @return null|Transaction the closing transaction or null if no entry written
     */
    public function close(ChronosDate $endDate, ?array &$output = null): ?Transaction
    {
        if ($endDate->isFuture()) {
            throw new ExceptionWithoutMailLogging('La date du bouclement ne peut pas être dans le futur');
        }

        // We actually generate the closure transaction at the beggining of the next day (ie. Jan 1st)
        // so that it is not taken into account by the accounting report for the closing day (ie. Dec 31th)
        $endDateTime = new Chronos($endDate)->addDays(1)->startOfDay();

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
            'expenses' => $this->accountRepository->findBy(['type' => AccountType::Expense]),
            'revenues' => $this->accountRepository->findBy(['type' => AccountType::Revenue]),
        ];

        $closingTransactioName = 'Bouclement au ' . $endDate->format('d.m.Y');

        if (is_array($output)) {
            $output[] = $closingTransactioName;
        }

        $existingClosingTransaction = $this->transactionRepository->findOneBy(['name' => $closingTransactioName, 'transactionDate' => $endDateTime]);

        if ($existingClosingTransaction) {
            throw new ExceptionWithoutMailLogging('Le bouclement a déjà été fait au ' . $endDate);
        }

        $closingTransaction = new Transaction();
        $closingTransaction->setTransactionDate($endDateTime);
        $closingTransaction->setInternalRemarks('Écriture générée automatiquement');
        $closingTransaction->setName($closingTransactioName);

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

    private function generateClosingEntries(array $allAccountsToClose, Transaction $closingTransaction, Account $closingAccount, ChronosDate $endDate): void
    {
        $closingEntries = [];
        foreach ($allAccountsToClose as $accountType => $accountsToClose) {
            foreach ($accountsToClose as $account) {
                /** @var Money $balance */
                $balance = $account->getBalanceAtDate($endDate);
                if ($balance->isZero()) {
                    continue;
                }
                if ($account->getType() === AccountType::Expense && !in_array(mb_substr((string) $account->getCode(), 0, 1), ['4', '5', '6'], true)) {
                    throw new Exception('Account ' . $account->getCode() . ' has an invalid code for an expense account');
                }
                if ($account->getType() === AccountType::Revenue && mb_substr((string) $account->getCode(), 0, 1) !== '3') {
                    throw new Exception('Account ' . $account->getCode() . ' has an invalid code for a revenue account');
                }
                $entry = [
                    'transactionDate' => $closingTransaction->getTransactionDate(),
                    'name' => 'Bouclement ' . $account->getName(),
                    'balance' => $balance->absolute(),
                ];
                if ($account->getType() === AccountType::Expense) {
                    if ($balance->isPositive()) {
                        $entry['credit'] = $account;
                        $entry['debit'] = $closingAccount;
                    } else {
                        $entry['credit'] = $closingAccount;
                        $entry['debit'] = $account;
                    }
                } elseif ($account->getType() === AccountType::Revenue) {
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
     * Print the error message and remember that at least one error was found.
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
        global $container;
        $config = $container->get('config');

        // Raw totals
        $assets = $this->accountRepository->totalBalanceByType(AccountType::Asset);
        $liabilities = $this->accountRepository->totalBalanceByType(AccountType::Liability);
        $revenue = $this->accountRepository->totalBalanceByType(AccountType::Revenue);
        $expense = $this->accountRepository->totalBalanceByType(AccountType::Expense);
        $equities = $this->accountRepository->totalBalanceByType(AccountType::Equity);
        $income = $revenue->subtract($expense);
        $discrepancy = $assets->subtract($income)->subtract($liabilities);

        // Report output
        /** @var AccountRepository $accountRepository */
        $accountRepository = _em()->getRepository(Account::class);
        $reportAccounts = $accountRepository->getAccountsForReport($config['accounting'], ChronosDate::today());
        $reportAssets = $this->sumReportAccounts($reportAccounts, AccountType::Asset->value);
        $reportLiabilities = $this->sumReportAccounts($reportAccounts, AccountType::Liability->value);
        $reportRevenue = $this->sumReportAccounts($reportAccounts, AccountType::Revenue->value);
        $reportExpense = $this->sumReportAccounts($reportAccounts, AccountType::Expense->value);
        $reportIncome = $reportRevenue->subtract($reportExpense);
        $reportDiscrepancy = $reportAssets->subtract($reportIncome)->subtract($reportLiabilities);

        echo '
Produits       : ' . $this->formatMoneyComparison($revenue, $reportRevenue) . '
Charges        : ' . $this->formatMoneyComparison($expense, $reportExpense) . '
Bénéfice       : ' . $this->formatMoneyComparison($income, $reportIncome) . '
Actifs         : ' . $this->formatMoneyComparison($assets, $reportAssets) . '
Passifs        : ' . $this->formatMoneyComparison($liabilities, $reportLiabilities) . '
Résultat       : ' . $this->formatMoney($equities) . '
Écart          : ' . $this->formatMoneyComparison($discrepancy, $reportDiscrepancy)
. PHP_EOL;

        if (!$revenue->equals($reportRevenue)) {
            $this->error(sprintf('ERREUR: produits différents de %s avec le rapport', $this->formatMoney($revenue->subtract($reportRevenue))));
        }
        if (!$expense->equals($reportExpense)) {
            $this->error(sprintf('ERREUR: charges différents de %s avec le rapport', $this->formatMoney($expense->subtract($reportExpense))));
        }
        if (!$assets->equals($reportAssets)) {
            $this->error(sprintf('ERREUR: actifs différents de %s avec le rapport', $this->formatMoney($assets->subtract($reportAssets))));
        }
        if (!$liabilities->equals($reportLiabilities)) {
            $this->error(sprintf('ERREUR: passifs différents de %s avec le rapport', $this->formatMoney($liabilities->subtract($reportLiabilities))));
        }
        if (!$discrepancy->equals($reportDiscrepancy)) {
            $this->error(sprintf('ERREUR: écarts différents de %s avec le rapport', $this->formatMoney($expense->subtract($reportExpense))));
        }
        if (!$discrepancy->isZero()) {
            $this->error(sprintf('ERREUR: écart de %s au total des comptes', $this->formatMoney($discrepancy)));
        }
        if (!$reportDiscrepancy->isZero()) {
            $this->error(sprintf('ERREUR: écart de %s au bilan des comptes', $this->formatMoney($discrepancy)));
        }
        if (!$equities->isZero()) {
            $this->error(sprintf('ERREUR: comptes de résultats non nulls : %s', $this->formatMoney($discrepancy)));
        }
    }

    private function formatMoneyComparison(Money $amount1, Money $amount2): string
    {
        if ($amount1->equals($amount2)) {
            return $this->formatMoney($amount1);
        }

        $diff = $amount2->subtract($amount1);
        $sign = $diff->isNegative() ? '' : '+';

        return $this->formatMoney($amount1) . ' ≠ ' . $this->formatMoney($amount2) . ' (' . $sign . $this->formatMoney($diff) . ')';
    }

    private function sumReportAccounts(array $reportAccounts, string $type): Money
    {
        return array_reduce(
            array_filter($reportAccounts, fn ($account) => $account['type'] === $type && $account['parent_id'] === null),
            fn ($sum, $account) => $sum->add(Money::CHF($account['balance'])),
            Money::CHF(0),
        );
    }

    private function formatMoney(mixed $amount): string
    {
        $money = $amount instanceof Money ? $amount : Money::CHF($amount);

        return Format::money($money) . ' CHF';
    }

    private function checkTransactionsAreBalanced(): void
    {
        $connection = _em()->getConnection();

        $sql = <<<STRING
             SELECT transaction_id,
                 SUM(IF(debit_id IS NOT NULL, balance, 0))  AS totalDebit,
                 SUM(IF(credit_id IS NOT NULL, balance, 0)) AS totalCredit
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
                    $user->getOwner()?->getId(),
                    $user->getOwner()?->getName(),
                ),
            );
        }
    }
}
