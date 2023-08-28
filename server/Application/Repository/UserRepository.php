<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\DBAL\Types\BookingTypeType;
use Application\Model\User;
use Cake\Chronos\Chronos;
use Doctrine\DBAL\Connection;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;

/**
 * @extends AbstractRepository<User>
 */
class UserRepository extends AbstractRepository implements LimitedAccessSubQuery
{
    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     */
    public function getAccessibleSubQuery(?\Ecodev\Felix\Model\User $user): string
    {
        if (!$user) {
            return '-1';
        }

        return $this->getAllIdsQuery();
    }

    /**
     * Returns the user authenticated by its email and password.
     */
    public function getOneByLoginPassword(string $login, string $password): ?User
    {
        $user = $this->getOneByLoginOrEmail($login);

        if (!$user) {
            return null;
        }

        // Check user status
        if (!$user->canLogin()) {
            return null;
        }

        $hashFromDb = $user->getPassword();
        $isMd5 = mb_strlen($hashFromDb) === 32 && ctype_xdigit($hashFromDb);

        // If we found a user and he has a correct MD5 or correct new hash, then return the user
        if (($isMd5 && md5($password) === $hashFromDb) || password_verify($password, $hashFromDb)) {
            // Update the hash in DB, if we are still MD5, or if PHP default options changed
            if ($isMd5 || password_needs_rehash($hashFromDb, PASSWORD_DEFAULT)) {
                $user->setPassword($password);
            }
            $user->revokeToken();
            _em()->flush();

            return $user;
        }

        return null;
    }

    /**
     * Unsecured way to get a user from its ID.
     *
     * This should only be used in tests or controlled environment.
     */
    public function getOneById(int $id): ?User
    {
        $user = $this->getAclFilter()->runWithoutAcl(fn () => $this->findOneById($id));

        return $user;
    }

    /**
     * Unsecured way to get a user from its login or its email.
     *
     * This should only be used in tests or controlled environment.
     */
    public function getOneByLoginOrEmail(?string $loginOrEmail): ?User
    {
        /** @var null|User $user */
        $user = $this->getAclFilter()->runWithoutAcl(
            fn () => $this->createQueryBuilder('user')
                ->orWhere('user.login IS NOT NULL AND user.login = :value')
                ->orWhere('user.email IS NOT NULL AND user.email = :value')
                ->setParameter('value', $loginOrEmail)
                ->getQuery()
                ->getOneOrNullResult()
        );

        return $user;
    }

    /**
     * Get all administrators to notify by email.
     *
     * @return User[]
     */
    public function getAllAdministratorsToNotify(): array
    {
        $qb = $this->createQueryBuilder('user')
            ->andWhere('user.status = :status')
            ->andWhere('user.role = :role')
            ->andWhere("user.email IS NOT NULL AND user.email != ''")
            ->setParameter('status', User::STATUS_ACTIVE)
            ->setParameter('role', User::ROLE_ADMINISTRATOR);

        $result = $this->getAclFilter()->runWithoutAcl(fn () => $qb->getQuery()->getResult());

        return $result;
    }

    public function getAllToQueueBalanceMessage(bool $onlyNegativeBalance = false): array
    {
        $qb = $this->createQueryBuilder('user')
            ->addSelect('account')
            ->addSelect('booking')
            ->addSelect('bookable')
            ->join('user.accounts', 'account')
            ->join('user.bookings', 'booking')
            ->join('booking.bookable', 'bookable')
            ->andWhere('user.status != :status')
            ->andWhere("user.email IS NOT NULL AND user.email != ''")
            ->andWhere('bookable.bookingType IN (:bookingType)')
            ->andWhere('bookable.isActive = true')
            ->andWhere('bookable.periodicPrice != 0')
            ->setParameter('bookingType', [BookingTypeType::MANDATORY, BookingTypeType::ADMIN_ASSIGNED], Connection::PARAM_STR_ARRAY)
            ->setParameter('status', User::STATUS_ARCHIVED)
            ->addOrderBy('user.id')
            ->addOrderBy('bookable.name');

        if ($onlyNegativeBalance) {
            $qb->andWhere('account.balance < 0');
        }

        $result = $this->getAclFilter()->runWithoutAcl(fn () => $qb->getQuery()->getResult());

        return $result;
    }

    /**
     * Return all users that are family owners (and should have Account).
     *
     * @return User[]
     */
    public function getAllFamilyOwners(): array
    {
        $qb = $this->createQueryBuilder('user')
            ->addSelect('account')
            ->leftJoin('user.accounts', 'account')
            ->andWhere('user.owner IS NULL')
            ->addOrderBy('user.id');

        return $qb->getQuery()->getResult();
    }

    /**
     * Return all users that are not family owners but still have an Account.
     *
     * @return User[]
     */
    public function getAllNonFamilyOwnersWithAccount(): array
    {
        $qb = $this->createQueryBuilder('user')
            ->join('user.accounts', 'account')
            ->andWhere('user.owner IS NOT NULL')
            ->addOrderBy('user.id');

        return $qb->getQuery()->getResult();
    }

    public function exists(string $login, ?int $excludedId): bool
    {
        if (null === $excludedId) {
            $excludedId = -1;
        }

        $sql = 'SELECT 1 FROM user WHERE login = :login AND id != :excludedId LIMIT 1';
        $params = [
            'login' => $login,
            'excludedId' => $excludedId,
        ];

        $result = $this->getEntityManager()->getConnection()->executeQuery($sql, $params)->fetchOne();

        return (bool) $result;
    }

    /**
     * Delete unconfirmed registrations older than a few days (user + account).
     *
     * @return int number of deleted users
     */
    public function deleteOldRegistrations(): int
    {
        $qb = $this->createQueryBuilder('user')
            ->addSelect('account')
            ->andWhere('user.login IS NULL AND user.creationDate < :creationDate')
            ->leftJoin('user.accounts', 'account')
            ->setParameter('creationDate', (new Chronos())->subDays(3));

        $users = $qb->getQuery()->getResult();

        foreach ($users as $user) {
            $account = $user->getAccount();
            if ($account) {
                _em()->remove($account);
            }
            _em()->remove($user);
        }
        _em()->flush();

        return count($users);
    }
}
