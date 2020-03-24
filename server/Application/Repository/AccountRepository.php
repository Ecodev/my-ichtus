<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Application\Model\User;
use Application\Utility;
use Doctrine\DBAL\Exception\InvalidArgumentException;
use Money\Money;

class AccountRepository extends AbstractRepository implements LimitedAccessSubQueryInterface
{
    private const PARENT_ACCOUNT_ID_FOR_USER = 10011;
    const ACCOUNT_ID_FOR_BANK = 10025;

    /**
     * @var Money[]
     */
    private $totalBalanceCache = [];

    /**
     * Clear all caches
     */
    public function clearCache(): void
    {
        $this->totalBalanceCache = [];
    }

    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     *
     * @param null|User $user
     *
     * @return string
     */
    public function getAccessibleSubQuery(?User $user): string
    {
        if (!$user) {
            return '-1';
        }

        if (in_array($user->getRole(), [User::ROLE_RESPONSIBLE, User::ROLE_ADMINISTRATOR], true)) {
            return $this->getAllIdsQuery();
        }

        return $this->getAllIdsForOwnerQuery($user);
    }

    /**
     * Unsecured way to get a account from its ID.
     *
     * This should only be used in tests or controlled environment.
     *
     * @param int $id
     *
     * @throws \Exception
     *
     * @return Account
     */
    public function getOneById(int $id): Account
    {
        $account = $this->getAclFilter()->runWithoutAcl(function () use ($id) {
            return $this->findOneById($id);
        });

        if (!$account) {
            throw new \Exception('Account #' . $id . ' not found');
        }

        return $account;
    }

    /**
     * This will return, and potentially create, an account for the given user
     *
     * @param User $user
     *
     * @return Account
     */
    public function getOrCreate(User $user): Account
    {
        // If an account already exists, because getOrCreate was called once before without flushing in between,
        // then can return immediately
        if ($user->getAccount()) {
            return $user->getAccount();
        }

        $account = $this->getAclFilter()->runWithoutAcl(function () use ($user) {
            return $this->findOneByOwner($user);
        });

        if (!$account) {
            $account = new Account();
            $this->getEntityManager()->persist($account);
            $account->setOwner($user);
            $account->setType(AccountTypeType::LIABILITY);
            $account->setName($user->getName());

            // Find the next available account code, using the liability parent code as prefix
            $nextQuery = 'SELECT MAX(children.code)+1 from account parent, account children where parent.id=' . self::PARENT_ACCOUNT_ID_FOR_USER . ' and children.code LIKE CONCAT(parent.code, \'%\')';
            $nextCode = (int) $this->getEntityManager()->getConnection()->fetchColumn($nextQuery);
            $account->setCode($nextCode);

            $parent = $this->getOneById(self::PARENT_ACCOUNT_ID_FOR_USER);
            $account->setParent($parent);
        }

        return $account;
    }

    /**
     * Sum balance by account type
     *
     * @API\Input(type="AccountType")
     *
     * @param string $accountType
     *
     * @return Money
     */
    public function totalBalanceByType(string $accountType): Money
    {
        $qb = $this->getEntityManager()->getConnection()->createQueryBuilder()
            ->select('SUM(balance)')
            ->from($this->getClassMetadata()->getTableName())
            ->where('type = :type');

        $qb->setParameter('type', $accountType);

        $result = $qb->execute();

        return Money::CHF($result->fetchColumn());
    }

    /**
     * Calculate the total balance of all child accounts of a group account
     *
     * @param Account $parentAccount
     *
     * @throws \Doctrine\DBAL\DBALException
     *
     * @return Money
     */
    public function totalBalanceByParent(Account $parentAccount): Money
    {
        if ($parentAccount->getType() !== AccountTypeType::GROUP) {
            throw new InvalidArgumentException(sprintf(
                'Cannot compute total balance for Account #%d of type %s',
                $parentAccount->getId(),
                $parentAccount->getType()
            ));
        }

        $cacheKey = Utility::getCacheKey(func_get_args());
        if (array_key_exists($cacheKey, $this->totalBalanceCache)) {
            return $this->totalBalanceCache[$cacheKey];
        }

        $connection = $this->getEntityManager()->getConnection();

        $sql = 'WITH RECURSIVE child AS
          (SELECT id, parent_id, `type`, balance
           FROM account WHERE id = ?
           UNION
           SELECT account.id, account.parent_id, account.type, account.balance
           FROM account
           JOIN child ON account.parent_id = child.id)
        SELECT SUM(balance) FROM child WHERE `type` <> ?';

        $result = $connection->executeQuery($sql, [$parentAccount->getId(), AccountTypeType::GROUP]);

        $money = Money::CHF($result->fetchColumn());
        $this->totalBalanceCache[$cacheKey] = $money;

        return $money;
    }

    /**
     * Update accounts' balance
     *
     * @param null|Account $account the account to update, or null for all accounts
     *
     * @throws \Doctrine\DBAL\DBALException
     */
    public function updateAccountBalance(?Account $account = null): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $sql = 'CALL update_account_balance(?)';

        if ($account) {
            $connection->executeQuery($sql, [$account->getId()]);
        } else {
            foreach ($this->findAll() as $a) {
                $connection->executeQuery($sql, [$a->getId()]);
            }
        }
    }

    /**
     * Return the next available Account code
     *
     * @return int
     */
    public function getNextCodeAvailable(): int
    {
        $qb = _em()->getConnection()->createQueryBuilder()
            ->select('IFNULL(MAX(a.code) + 1, 1)')
            ->from('account', 'a');

        return (int) $qb->execute()->fetchColumn();
    }
}
