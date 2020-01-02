<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\User;
use Cake\Chronos\Chronos;
use Doctrine\DBAL\Connection;
use Laminas\Log\Logger;

class LogRepository extends AbstractRepository implements LimitedAccessSubQueryInterface
{
    /**
     * Log message to be used when user log in
     */
    const LOGIN = 'login';

    /**
     * Log message to be used when user cannot log in
     */
    const LOGIN_FAILED = 'login failed';

    /**
     * Log message to be used when user change his password
     */
    const UPDATE_PASSWORD = 'update password';

    /**
     * Log message to be used when user cannot change his password
     */
    const UPDATE_PASSWORD_FAILED = 'update password failed';

    /**
     * Log message to be used when trying to send email but it's already running
     */
    const MAILER_LOCKED = 'Unable to obtain lock for mailer, try again later.';

    /**
     * Log message to be used when a door is opened
     */
    const DOOR_OPENED = 'door opened: ';

    /**
     * This should NOT be called directly, instead use `_log()` to log stuff
     *
     * @param array $event
     */
    public function log(array $event): void
    {
        $event['creation_date'] = Chronos::instance($event['creation_date'])->toIso8601String();
        $event['extra'] = json_encode($event['extra']);

        $this->getEntityManager()->getConnection()->insert('log', $event);
    }

    /**
     * Returns whether the current IP often failed to login
     *
     * @return bool
     */
    public function loginFailedOften(): bool
    {
        return $this->failedOften(self::LOGIN, self::LOGIN_FAILED);
    }

    public function updatePasswordFailedOften(): bool
    {
        return $this->failedOften(self::UPDATE_PASSWORD, self::UPDATE_PASSWORD_FAILED);
    }

    private function failedOften(string $success, string $failed): bool
    {
        if (PHP_SAPI === 'cli') {
            $ip = 'script';
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        }

        $select = $this->getEntityManager()->getConnection()->createQueryBuilder()
            ->select('message')
            ->from('log')
            ->andWhere('priority = :priority')
            ->setParameter('priority', Logger::INFO)
            ->andWhere('message IN (:message)')
            ->setParameter('message', [$success, $failed], Connection::PARAM_STR_ARRAY)
            ->andWhere('creation_date > DATE_SUB(NOW(), INTERVAL 30 MINUTE)')
            ->andWhere('ip = :ip')
            ->setParameter('ip', $ip)
            ->orderBy('id', 'DESC');

        $events = $select->execute()->fetchAll(\PDO::FETCH_COLUMN);

        // Goes from present to past and count failure, until the last time we succeeded logging in
        $failureCount = 0;
        foreach ($events as $event) {
            if ($event === $success) {
                break;
            }
            ++$failureCount;
        }

        return $failureCount > 20;
    }

    /**
     * Delete log entries which are errors/warnings and older than one month
     * We always keep Logger::INFO level because we use it for statistics
     *
     * @return int the count deleted logs
     */
    public function deleteOldLogs(): int
    {
        $connection = $this->getEntityManager()->getConnection();
        $query = $connection->createQueryBuilder()
            ->delete('log')
            ->andWhere('log.priority != :priority OR message = :message')
            ->setParameter('priority', Logger::INFO)
            ->setParameter('message', self::LOGIN_FAILED)
            ->andWhere('log.creation_date < DATE_SUB(NOW(), INTERVAL 1 MONTH)');

        $connection->query('LOCK TABLES `log` WRITE;');
        $count = $query->execute();
        $connection->query('UNLOCK TABLES;');

        return $count;
    }

    public function getLoginDate(User $user, bool $first): ?Chronos
    {
        $qb = $this->createQueryBuilder('log')
            ->select('log.creationDate')
            ->andWhere('log.creator = :user')
            ->andWhere('log.message = :message')
            ->setParameter('user', $user)
            ->setParameter('message', self::LOGIN)
            ->addOrderBy('log.creationDate', $first ? 'ASC' : 'DESC');

        $result = $this->getAclFilter()->runWithoutAcl(function () use ($qb) {
            return $qb->getQuery()->setMaxResults(1)->getOneOrNullResult();
        });

        return $result['creationDate'];
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

        // Sysops and responsible can read all logs
        if (in_array($user->getRole(), [User::ROLE_RESPONSIBLE, User::ROLE_ADMINISTRATOR], true)) {
            return $this->getAllIdsQuery();
        }

        $subquery = '
            SELECT log.id FROM `log` WHERE
            message LIKE ' . $this->getEntityManager()->getConnection()->quote(self::DOOR_OPENED . '%') . '
            AND log.creator_id = ' . $user->getId();

        return $subquery;
    }
}
