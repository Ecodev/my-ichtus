<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Enum\AccountType;
use Application\Model\Account;
use Application\Model\User;
use Doctrine\ORM\Query;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;
use Exception;
use Money\Money;

/**
 * @extends AbstractRepository<Account>
 *
 * @method null|Account findOneByCode(int $code)
 */
class AccountRepository extends AbstractRepository implements LimitedAccessSubQuery
{
    /**
     * In memory max code that keep being incremented if we create several account at once without flushing in DB.
     */
    private ?int $maxCode = null;

    /**
     * Clear all caches.
     */
    public function clearCache(): void
    {
        $this->maxCode = null;
    }

    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     *
     * @param null|User $user
     */
    public function getAccessibleSubQuery(?\Ecodev\Felix\Model\User $user): string
    {
        if (!$user) {
            return '-1';
        }

        if (in_array($user->getRole(), [
            User::ROLE_TRAINER,
            User::ROLE_ACCOUNTING_VERIFICATOR,
            User::ROLE_FORMATION_RESPONSIBLE,
            User::ROLE_RESPONSIBLE,
            User::ROLE_ADMINISTRATOR,
        ], true)) {
            return '';
        }

        return $this->getAllIdsForFamilyQuery($user);
    }

    /**
     * Unsecured way to get a account from its ID.
     *
     * This should only be used in tests or controlled environment.
     */
    public function getOneById(int $id): Account
    {
        $account = $this->getAclFilter()->runWithoutAcl(fn () => $this->findOneById($id));

        if (!$account) {
            throw new Exception('Account #' . $id . ' not found');
        }

        return $account;
    }

    /**
     * This will return, and potentially create, an account for the given user.
     */
    public function getOrCreate(User $user): Account
    {
        global $container;

        // If an account already exists, because getOrCreate was called once before without flushing in between,
        // then can return immediately
        if ($user->getAccount()) {
            return $user->getAccount();
        }

        // If user have an owner, then create account for the owner instead
        if ($user->getOwner()) {
            $user = $user->getOwner();
        }

        $account = $this->getAclFilter()->runWithoutAcl(fn () => $this->findOneByOwner($user));

        if (!$account) {
            $account = new Account();
            $this->getEntityManager()->persist($account);
            $account->setOwner($user);
            $account->setType(AccountType::Liability);
            $account->setName($user->getName());

            $config = $container->get('config');
            $parentCode = (int) $config['accounting']['customerDepositsAccountCode'];
            $parent = $this->getAclFilter()->runWithoutAcl(fn () => $this->findOneByCode($parentCode));

            // Find the max account code, using the liability parent code as prefix
            if (!$this->maxCode) {
                $maxQuery = 'SELECT MAX(code) FROM account WHERE code LIKE ' . $this->getEntityManager()->getConnection()->quote($parent->getCode() . '%');
                $this->maxCode = (int) $this->getEntityManager()->getConnection()->fetchOne($maxQuery);

                // If there is no child account yet, reserve enough digits for many users
                if ($this->maxCode === $parent->getCode()) {
                    $this->maxCode = $parent->getCode() * 10000;
                }
            }

            $nextCode = ++$this->maxCode;
            $account->setCode($nextCode);

            $account->setParent($parent);
        }

        return $account;
    }

    /**
     * Sum balance by account type.
     */
    public function totalBalanceByType(AccountType $accountType): Money
    {
        $qb = $this->getEntityManager()->getConnection()->createQueryBuilder()
            ->select('SUM(balance)')
            ->from($this->getClassMetadata()->getTableName())
            ->where('type = :type');

        $qb->setParameter('type', $accountType->value);

        $result = $qb->executeQuery();

        return Money::CHF($result->fetchOne());
    }

    /**
     * Update all accounts' balance.
     */
    public function updateAccountsBalance(): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $sql = 'CALL update_account_balance(0)';
        $connection->executeQuery($sql);
    }

    /**
     * Return the next available Account code.
     */
    public function getNextCodeAvailable(?Account $parent): int
    {
        $connection = $this->getEntityManager()->getConnection();

        return (int) $connection->fetchOne('SELECT IFNULL(MAX(code) + 1, 1) FROM account WHERE IF(:parent IS NULL, parent_id IS NULL, parent_id = :parent)', [
            'parent' => $parent?->getId(),
        ]);
    }

    public function getRootAccountsQuery(): Query
    {
        $qb = $this->createQueryBuilder('account')
            ->andWhere('account.parent IS NULL')
            ->orderBy('account.code');

        return $qb->getQuery();
    }

    public function deleteAccountOfNonFamilyOwnerWithoutAnyTransactions(): int
    {
        $sql = <<<STRING
                DELETE account FROM account
                INNER JOIN user ON account.owner_id = user.id
                AND user.owner_id IS NOT NULL
                AND user.owner_id != user.id
                WHERE
                account.id NOT IN (SELECT credit_id FROM transaction_line WHERE credit_id IS NOT NULL)
                AND account.id NOT IN (SELECT debit_id FROM transaction_line WHERE debit_id IS NOT NULL) 
            STRING;

        /** @var int $count */
        $count = $this->getEntityManager()->getConnection()->executeStatement($sql);

        return $count;
    }

    /**
     * Native query to return the IDs of myself and all recursive descendants
     * of the one passed as parameter.
     */
    private function getSelfAndDescendantsSubQuery(int $itemId): string
    {
        $table = $this->getClassMetadata()->table['name'];

        $connection = $this->getEntityManager()->getConnection();
        $table = $connection->quoteIdentifier($table);

        $entireHierarchySql = "
            WITH RECURSIVE parent AS (
                    SELECT $table.id, $table.parent_id FROM $table WHERE $table.id IN ($itemId)
                    UNION
                    SELECT $table.id, $table.parent_id FROM $table JOIN parent ON $table.parent_id = parent.id
                )
            SELECT id FROM parent ORDER BY id";

        return trim($entireHierarchySql);
    }

    /**
     * Whether the account, or any of its subaccounts, has any transaction at all.
     */
    public function hasTransaction(Account $account): bool
    {
        $id = $account->getId();
        if (!$id) {
            return false;
        }

        $wholeHierarchy = $this->getSelfAndDescendantsSubQuery($id);

        $hierarchyHasSomeTransactionLines = $this->getEntityManager()->getConnection()->fetchOne(
            <<<SQL
                SELECT EXISTS (
                    SELECT * FROM transaction_line
                    INNER JOIN ($wholeHierarchy) AS tmp ON transaction_line.credit_id = tmp.id OR transaction_line.debit_id = tmp.id
                );
                SQL
        );

        return (bool) $hierarchyHasSomeTransactionLines;
    }
}
