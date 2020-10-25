<?php

declare(strict_types=1);

namespace Application\Service;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionRepository;
use Application\Repository\UserRepository;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Format;
use Throwable;

/**
 * Service to process accounting tasks
 */
class Accounting
{
    private EntityManager $entityManager;

    private TransactionRepository $transactionRepository;

    private AccountRepository $accountRepository;

    private UserRepository $userRepository;

    private bool $hasError = false;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
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
        $this->accountRepository->updateAccountBalance();

        $this->checkAccounts();
        $this->checkTransactionsAreBalanced();
        $this->checkMissingAccountsForUsers();
        $this->checkUnnecessaryAccounts();
        $this->checkFamilyMembersShareSameAccount();

        return $this->hasError;
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
        foreach (_em()->getRepository(Transaction::class)->findAll() as $transaction) {
            try {
                $transaction->checkBalance();
            } catch (Throwable $e) {
                $this->error($e->getMessage());
            }
        }
    }

    private function checkMissingAccountsForUsers(): void
    {
        // Create missing accounts for users
        foreach ($this->userRepository->getAllFamilyOwners() as $user) {
            if (!$user->getAccount()) {
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
