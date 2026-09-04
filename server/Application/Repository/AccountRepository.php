<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Enum\AccountType;
use Application\Enum\BalanceGrouping;
use Application\Model\Account;
use Application\Model\User;
use Cake\Chronos\ChronosDate;
use Doctrine\DBAL\ArrayParameterType;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;
use Exception;
use Money\Money;

/**
 * @extends AbstractHasParentRepository<Account>
 *
 * @method null|Account findOneByCode(int $code)
 *
 * @phpstan-type AccountForReport array{
 *      id: int,
 *      code: string,
 *      name: string,
 *      depth: int,
 *      path: string,
 *      type: string,
 *      balance: int,
 *      previousBalance: int,
 *      budget_allowed: int,
 *      budget_balance: int,
 *      parent_id?: int
 * }
 * @phpstan-type AccountBalance array{
 *      id: int,
 *      code: int,
 *      name: string,
 *      parent_id: ?int,
 *      budget_allowed: ?int,
 *      type: ?string,
 *      balance: ?int,
 *      previousBalance: ?int
 * }
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
            assert($parent !== null);

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
     * Return all accounts owned by a family member who is not the family owner.
     *
     * Eagerly loads the owner, the family owner, and the family owner's account, since callers need
     * all of that to regularize the situation without any further query.
     */
    public function getAllOwnedByNonFamilyOwner(): array
    {
        $qb = $this->createQueryBuilder('account')
            ->addSelect('owner', 'familyOwner', 'familyOwnerAccount')
            ->join('account.owner', 'owner')
            ->join('owner.owner', 'familyOwner')
            ->leftJoin('familyOwner.accounts', 'familyOwnerAccount')
            ->addOrderBy('owner.id');

        return $qb->getQuery()->getResult();
    }

    /**
     * Sum balance by account type.
     */
    public function totalBalanceByType(AccountType $accountType): Money
    {
        $amount = $this->getEntityManager()->getConnection()->fetchOne('SELECT IFNULL(SUM(balance), 0) FROM account WHERE type = :type', [
            'type' => $accountType->value,
        ]);

        return Money::CHF($amount);
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
     * Calls all accounts values, then adds a display layout (filter zeros, limit deep etc...).
     *
     * @param mixed $config
     *
     * @return list<AccountForReport>
     */
    public function getAccountsForReport($config, ?ChronosDate $date, ?ChronosDate $previousDate = null): array
    {
        $query = $this->buildAccountsBalancesQuery($date, $previousDate);
        $balancesCTE = $query['cte'];
        $queryParams = $query['params'] + [
            'maxDepth' => $config['report']['maxAccountDepth'],
            'showZero' => $config['report']['showAccountsWithZeroBalance'],
            'customerDepositsAccountCode' => $config['customerDepositsAccountCode'],
        ];

        $sql = <<<SQL

                WITH RECURSIVE
                $balancesCTE,

                -- Descending Recursivity
                -- Prepares a set of data with depth and path for display purposes
                depth_tree AS (
                    SELECT id, 1 AS depth, CAST(LPAD(code, 12, '0') AS CHAR(255)) as path
                    FROM account WHERE parent_id IS NULL
                    UNION ALL
                    SELECT child.id, parent.depth + 1, CONCAT(parent.path, '>', LPAD(child.code, 12, '0'))
                    FROM account child INNER JOIN depth_tree parent ON child.parent_id = parent.id
                )

                -- Apply display constraints (limit max depth, exclude customers personnal accounts and with or without 0 balance)
                -- Wrap in subquery because HAVING can't access to computed balances and WHERE can't access to showZero but we need a condition on both at the same time
                SELECT *, budget_allowed - balance as budget_balance FROM (
                    SELECT t.id, t.code, IF(CHAR_LENGTH(t.name) > 55, CONCAT(SUBSTRING(t.name, 1, 55), '...'), t.name) as name,
                           t.parent_id, t.type, t.budget_allowed, dt.depth,
                           SUM(t.balance) AS balance, SUM(t.previousBalance) AS previousBalance,
                           MAX(t.alwaysShow) AS alwaysShow
                    FROM account_tree t
                        JOIN depth_tree dt ON dt.id = t.id and dt.depth <= :maxDepth + 1
                    WHERE
                        NOT EXISTS (SELECT 1 FROM account customer_deposits WHERE customer_deposits.id = t.parent_id AND customer_deposits.code = :customerDepositsAccountCode)
                    GROUP BY t.id, t.type
                    ORDER BY dt.path
                ) sub
                WHERE :showZero OR balance != 0 OR previousBalance != 0 OR alwaysShow = 1
            SQL;

        /** @var list<AccountForReport> $result */
        $result = _em()->getConnection()->executeQuery($sql, $queryParams)->fetchAllAssociative();

        return $result;
    }

    /**
     * Balance of each account at a date, and optionally at a previous date, where the balance of a
     * group is the total of its descendants.
     *
     * A date is included and refers to the state at the end of that day, be it in the past or in
     * the future. A null date is the current state, which excludes entries dated later today.
     *
     * @param null|list<int> $accountIds restrict the returned accounts, without restricting what they total
     *
     * @return list<AccountBalance>
     */
    public function getAccountsBalances(
        ?ChronosDate $date,
        ?ChronosDate $previousDate = null,
        ?array $accountIds = null,
        BalanceGrouping $grouping = BalanceGrouping::PerType,
    ): array {
        $query = $this->buildAccountsBalancesQuery($date, $previousDate);

        $balancesCTE = $query['cte'];
        $queryParams = $query['params'];
        $queryTypes = [];

        $accountFilter = '';
        if ($accountIds !== null) {
            $accountFilter = 'WHERE t.id IN (:accountIds)';
            $queryParams['accountIds'] = $accountIds;
            $queryTypes['accountIds'] = ArrayParameterType::INTEGER;
        }

        if ($grouping === BalanceGrouping::PerType) {
            $selects = 't.type, SUM(t.balance) AS balance, SUM(t.previousBalance) AS previousBalance';
            $groupBy = 't.id, t.type';
        } else {
            // A group totalling incompatible types has no meaningful balance, nor type, the same
            // way `update_account_balance` in triggers.sql sets `account.balance` to NULL for it.
            // Both must be kept in sync.
            // Only revenue and expense can be totalled together, and the result is a revenue,
            // since a negative revenue is an expense. An account that is at zero on both dates is
            // ignored, because it cannot distort any total.
            $hasImpact = '(t.balance != 0 OR t.previousBalance != 0)';
            $impactingType = "IF($hasImpact, t.type, NULL)";
            $mixesTypes = "COUNT(DISTINCT $impactingType) > 1";
            $mixesIncompatibleTypes = "$mixesTypes AND MAX(IF($hasImpact, t.type NOT IN ('revenue', 'expense'), 0))";
            $selects = <<<SQL
                IF($mixesIncompatibleTypes, NULL, IF($mixesTypes, 'revenue', COALESCE(MIN($impactingType), MIN(t.type)))) AS type,
                        IF($mixesIncompatibleTypes, NULL, SUM(t.balance)) AS balance,
                        IF($mixesIncompatibleTypes, NULL, SUM(t.previousBalance)) AS previousBalance
                SQL;
            $groupBy = 't.id';
        }

        $sql = <<<SQL

                WITH RECURSIVE
                $balancesCTE

                SELECT t.id, t.code, t.name, t.parent_id, t.budget_allowed, $selects
                FROM account_tree t
                $accountFilter
                GROUP BY $groupBy
            SQL;

        $rows = _em()->getConnection()->executeQuery($sql, $queryParams, $queryTypes)->fetchAllAssociative();

        return array_map(fn (array $row): array => [
            'id' => (int) $row['id'],
            'code' => (int) $row['code'],
            'name' => (string) $row['name'],
            'parent_id' => $row['parent_id'] === null ? null : (int) $row['parent_id'],
            'budget_allowed' => $row['budget_allowed'] === null ? null : (int) $row['budget_allowed'],
            'type' => $row['type'] === null ? null : (string) $row['type'],
            'balance' => $row['balance'] === null ? null : (int) $row['balance'],
            'previousBalance' => $row['previousBalance'] === null ? null : (int) $row['previousBalance'],
        ], $rows);
    }

    /**
     * How much the balance of each account moved over a period, both bounds included.
     *
     * Without a start date the period begins before the very first entry, without an end date it
     * runs up to now.
     *
     * @param null|list<int> $accountIds restrict the returned accounts, without restricting what they total
     *
     * @return array<int, ?int> how much each account moved, by account id, null for a group totalling
     *                          incompatible types since it has no balance to compare in the first place
     */
    public function getAccountsVariations(?ChronosDate $from, ?ChronosDate $to, ?array $accountIds = null): array
    {
        // The start date is turned into the day before it, so it can no longer be compared to the
        // end date afterwards. An absent end date is now, which is what it must be compared to.
        if ($from !== null && ($to ?? ChronosDate::today())->lessThan($from)) {
            throw new Exception('Period cannot start after it ends');
        }

        $balances = $this->getAccountsBalances($to, $from?->subDays(1), $accountIds, BalanceGrouping::PerAccount);

        $variations = [];
        foreach ($balances as $balance) {
            $variations[$balance['id']] = $balance['balance'] === null || $balance['previousBalance'] === null
                ? null
                : $balance['balance'] - $balance['previousBalance'];
        }

        return $variations;
    }

    /**
     * Build the CTE totalling the accounting entries of every account, and of every descendant of a
     * group, at a date and optionally at a previous date. The last CTE it declares is `account_tree`,
     * which holds one row per account and per descendant contributing to it.
     *
     * @return array{cte: string, params: array<string, mixed>}
     */
    private function buildAccountsBalancesQuery(?ChronosDate $date, ?ChronosDate $previousDate): array
    {
        // Comparing an account with itself on the same day totals nothing, so the previous date
        // must be strictly older than the date
        if ($date !== null && $previousDate !== null && !$previousDate->lessThan($date)) {
            throw new Exception('Previous date must be strictly older than date');
        }

        // Stores list of query selects and parameters
        $querySelects = [];
        $queryParams = [
            'groupType' => AccountType::Group->value,
        ];

        // A date is honoured as it is given, so its balance is summed from the accounting entries.
        // Only an absent date, which means now, is read from the balance cached on the account.
        $balanceCTE = '';
        $balancesJoin = '';
        if ($date !== null || $previousDate !== null) {
            $dates = array_filter([$date, $previousDate]);
            assert($dates !== []);
            $queryParams['mostRecentDate'] = max($dates);
            $debitBalanceSelects = [];
            $creditBalanceSelects = [];
            $balanceColumns = [];

            if ($date !== null) {
                $debitBalanceSelects[] = $this->getLineBalanceSelect('reportDate', 'balance', 'debit_account', "'asset', 'expense'");
                $creditBalanceSelects[] = $this->getLineBalanceSelect('reportDate', 'balance', 'credit_account', "'liability', 'equity', 'revenue'");
                $balanceColumns[] = 'COALESCE(SUM(balance), 0) AS balance';
            } else {
                $debitBalanceSelects[] = '0 AS balance';
                $creditBalanceSelects[] = '0 AS balance';
                $balanceColumns[] = '0 AS balance';
            }

            if ($previousDate !== null) {
                $debitBalanceSelects[] = $this->getLineBalanceSelect('previousDate', 'previousBalance', 'debit_account', "'asset', 'expense'");
                $creditBalanceSelects[] = $this->getLineBalanceSelect('previousDate', 'previousBalance', 'credit_account', "'liability', 'equity', 'revenue'");
                $balanceColumns[] = 'COALESCE(SUM(previousBalance), 0) AS previousBalance';
            } else {
                $debitBalanceSelects[] = '0 AS previousBalance';
                $creditBalanceSelects[] = '0 AS previousBalance';
                $balanceColumns[] = '0 AS previousBalance';
            }

            $debitSelects = implode(', ', $debitBalanceSelects);
            $creditSelects = implode(', ', $creditBalanceSelects);
            $balanceSelects = implode(', ', $balanceColumns);
            $balanceCTE = <<<SQL
                
                line_amounts AS (
                    SELECT tl.debit_id AS account_id, $debitSelects
                    FROM transaction_line tl
                    INNER JOIN account debit_account ON debit_account.id = tl.debit_id
                    WHERE DATE(tl.transaction_date) <= :mostRecentDate
                    UNION ALL
                    SELECT tl.credit_id AS account_id, $creditSelects
                    FROM transaction_line tl
                    INNER JOIN account credit_account ON credit_account.id = tl.credit_id
                    WHERE DATE(tl.transaction_date) <= :mostRecentDate
                ),
                
                balances AS (
                    SELECT account_id, $balanceSelects
                    FROM line_amounts
                    GROUP BY account_id
                ),
                SQL;
            $balancesJoin = 'LEFT JOIN balances b ON b.account_id = a.id';
        }

        if ($date !== null) {
            $paramName = 'reportDate';
            $querySelects[] = 'COALESCE(b.balance, 0) AS balance';
            $queryParams[$paramName] = $date;
        } else {
            $querySelects[] = 'a.balance AS balance';
        }

        // Without a previous date the period starts before the first entry, so nothing precedes it
        if ($previousDate !== null) {
            $paramName = 'previousDate';
            $querySelects[] = 'COALESCE(b.previousBalance, 0) AS previousBalance';
            $queryParams[$paramName] = $previousDate;
        } else {
            $querySelects[] = '0 as previousBalance';
        }

        $selects = implode(', ', $querySelects);
        $cte = <<<SQL
            $balanceCTE

                -- Hierarchy starting by children
                -- Prepares a set of children because they have the data (balance)
                children AS (
                    SELECT a.id, a.code, a.name, a.type, a.parent_id, a.budget_allowed, $selects
                    FROM account a
                    $balancesJoin
                    WHERE a.type != :groupType
                    GROUP BY a.id
                ),

                -- Ascending recursivity
                -- Start with children and complete the set with parents.
                -- Parents are appened to the set for each child with the child balance for further group/sum and the child type to duplicate the parent in case of children type mix.
                account_tree AS (
                    SELECT
                        id, code, name, parent_id, type, budget_allowed, balance, previousBalance, 0 as alwaysShow
                    FROM children
                    UNION ALL
                    SELECT
                        parent.id, parent.code, parent.name, parent.parent_id, child.type, parent.budget_allowed,
                        child.balance, child.previousBalance,
                        CASE WHEN child.balance > 0 THEN 1 ELSE 0 END AS alwaysShow
                    FROM account parent
                    INNER JOIN account_tree child ON child.parent_id = parent.id
                )
            SQL;

        return ['cte' => $cte, 'params' => $queryParams];
    }

    /**
     * Returns SQL string for a transaction line balance select.
     */
    private function getLineBalanceSelect(string $dateParamName, string $columnName, string $accountAlias, string $positiveTypes): string
    {
        return <<<SQL
            CASE WHEN DATE(tl.transaction_date) <= :$dateParamName THEN
                CASE
                    WHEN $accountAlias.type IN ($positiveTypes) THEN tl.balance
                    ELSE -tl.balance
                END
            END AS $columnName
            SQL;
    }

    /**
     * Delete useless accounts without any transaction: a family member's own account, or an orphan account.
     */
    public function deleteUselessAccounts(): int
    {
        global $container;
        $config = $container->get('config');
        $groupCode = (int) $config['accounting']['customerDepositsAccountCode'];

        $sql = <<<SQL
            DELETE account FROM account
            LEFT JOIN account parent ON account.parent_id = parent.id
            LEFT JOIN user ON account.owner_id = user.id
            WHERE ((account.owner_id IS NULL AND parent.code = :groupCode) OR (user.owner_id IS NOT NULL AND user.owner_id != user.id))
            AND account.id NOT IN (SELECT credit_id FROM transaction_line WHERE credit_id IS NOT NULL)
            AND account.id NOT IN (SELECT debit_id FROM transaction_line WHERE debit_id IS NOT NULL)
            SQL;

        /** @var int $count */
        $count = $this->getEntityManager()->getConnection()->executeStatement($sql, ['groupCode' => $groupCode]);

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
