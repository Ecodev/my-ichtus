<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Enum\AccountType;
use Application\Model\Account;
use Application\Model\User;
use Cake\Chronos\ChronosDate;
use Doctrine\ORM\Query;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;
use Exception;
use Money\Money;

/**
 * @extends AbstractHasParentRepository<Account>
 *
 * @method null|Account findOneByCode(int $code)
 */
class AccountRepository extends AbstractHasParentRepository implements LimitedAccessSubQuery
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

    public function transferBudgetsToNextYear(): int
    {
        return (int) $this->getEntityManager()->getConnection()->executeStatement(
            'UPDATE account SET budget_las_year = budget_allowed, budget_allowed = budget_next_year, budget_next_year = NULL',
        );
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

    /**
     * Returns all accounts for Excel report with totals and sorting.
     *
     * @param mixed $config
     *
     * @return list<AccountForReport>
     */
    public function getAccountsForReport($config, ChronosDate $date, ?ChronosDate $previousDate = null): array
    {
        // Throw error if date is less than previousDate
        if ($previousDate !== null && $date->lessThan($previousDate)) {
            throw new Exception('Date cannot be less than previous date');
        }

        // Stores list of query selects and parameters
        $querySelects = [];
        $queryParams = [
            'groupType' => AccountType::Group->value,
            'maxDepth' => $config['report']['maxAccountDepth'],
            'showZero' => $config['report']['showAccountsWithZeroBalance'],
            'customerDepositsAccountCode' => $config['customerDepositsAccountCode'],
        ];

        $today = ChronosDate::today();

        // Decides if we need to compute transactions lines (if any date is in the past) and join TL
        $isReferenceDateInThePast = $date->lessThan($today);
        $isPreviousDateInThePast = $previousDate !== null && $previousDate->lessThan($today);
        $transactionsJoin = '';
        if ($isReferenceDateInThePast || $isPreviousDateInThePast) {
            $queryParams['mostRecentPastDate'] = max(array_filter([$date, $previousDate]));
            $transactionsJoin = 'LEFT JOIN transaction_line tl ON (tl.debit_id = a.id OR tl.credit_id = a.id) AND DATE(tl.transaction_date) <= :mostRecentPastDate';
        }

        if ($isReferenceDateInThePast) {
            // If reference date is in the past, determines balance by summing transactions
            $paramName = 'reportDate';
            $querySelects[] = $this->getBalanceSelect($paramName, 'balance');
            $queryParams[$paramName] = $date;
        } else {
            // If today date, use "cache" account.balance
            $querySelects[] = 'a.balance';
        }

        // If we have a previous date, sum their transactions
        if ($isPreviousDateInThePast) {
            $paramName = 'previousDate';
            $querySelects[] = $this->getBalanceSelect($paramName, 'previousBalance');
            $queryParams[$paramName] = $previousDate;
        } else {
            $querySelects[] = '0 as previousBalance';
        }

        $selects = implode(', ', $querySelects);
        $sql = <<<SQL
            
                WITH RECURSIVE 
                
                children AS (
                    SELECT a.id, a.code, IF(CHAR_LENGTH(a.name) > 55, CONCAT(SUBSTRING(a.name, 1, 55), '...'), a.name) as name, a.type, a.parent_id, parent.code AS parent_code, a.budget_allowed, a.code AS path, $selects
                    FROM account a 
                    $transactionsJoin
                    LEFT JOIN account parent ON parent.id = a.parent_id
                    WHERE a.type != :groupType
                    GROUP BY a.id
                ),
                
               account_tree AS (
                    SELECT 
                        id, code, name, parent_id, parent_code, type, budget_allowed, balance, previousBalance, path, 0 as alwaysShow 
                    FROM children
                    UNION ALL
                    SELECT 
                        parent.id, parent.code, parent.name, parent.parent_id, grand_parent.code AS parent_code, child.type, parent.budget_allowed, 
                        child.balance, child.previousBalance, CONCAT(parent.code, '/', child.path), 
                        CASE WHEN child.balance > 0 THEN 1 ELSE 0 END AS alwaysShow
                    FROM account parent
                    LEFT JOIN account grand_parent ON grand_parent.id = parent.parent_id
                    INNER JOIN account_tree child ON child.parent_id = parent.id
                ),
                            
                depth_tree AS (
                    SELECT id, 1 AS depth, CAST(LPAD(code, 12, '0') AS CHAR(255)) as path
                    FROM account WHERE parent_id IS NULL
                    UNION ALL
                    SELECT child.id, parent.depth + 1, CONCAT(parent.path, '>', LPAD(child.code, 12, '0'))
                    FROM account child INNER JOIN depth_tree parent ON child.parent_id = parent.id
                )   

                SELECT *, budget_allowed - balance as budget_balance FROM (
                    SELECT t.id, t.code, t.name, t.parent_id, t.type, t.budget_allowed, dt.depth,
                           SUM(t.balance) AS balance, SUM(t.previousBalance) AS previousBalance, MAX(t.alwaysShow) AS alwaysShow
                    FROM account_tree t
                        JOIN depth_tree dt ON dt.id = t.id and dt.depth <= :maxDepth + 1
                    WHERE  t.parent_code != :customerDepositsAccountCode OR t.parent_id IS NULL
                    GROUP BY t.id, t.type
                    ORDER BY dt.path
                ) sub
                WHERE :showZero OR balance != 0 OR previousBalance != 0 OR alwaysShow = 1
            SQL;

        return _em()->getConnection()->executeQuery($sql, $queryParams)->fetchAllAssociative();
    }

    /**
     * Returns SQL string for a balance select that sum transaction balances.
     */
    private function getBalanceSelect(string $dateParamName, string $columnName): string
    {
        return <<<SQL
            COALESCE(SUM(
                CASE WHEN DATE(tl.transaction_date) <= :$dateParamName THEN
                    CASE
                        WHEN tl.debit_id  = a.id AND a.type IN ('asset', 'expense')               THEN tl.balance
                        WHEN tl.credit_id = a.id AND a.type IN ('liability', 'equity', 'revenue') THEN tl.balance
                        ELSE -tl.balance
                    END
                END
            ), 0) AS $columnName
            SQL;
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
     * Whether the account, or any of its subaccounts, has any transaction at all.
     */
    public function hasTransaction(Account $account): bool
    {
        $id = $account->getId();
        if (!$id) {
            return false;
        }

        $wholeHierarchy = $this->getSelfAndDescendantsSubQuery([$id]);

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
