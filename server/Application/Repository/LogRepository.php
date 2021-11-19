<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\User;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;

class LogRepository extends AbstractRepository implements \Ecodev\Felix\Repository\LogRepository, LimitedAccessSubQuery
{
    /**
     * Log message to be used when a door is opened
     */
    public const DOOR_OPENED = 'door opened: ';
    /**
     * Log message to be used when the datatrans webhook starts
     */
    public const DATATRANS_WEBHOOK_BEGIN = 'datatrans webhook begin';
    /**
     * Log message to be used when the datatrans webhook finishes
     */
    public const DATATRANS_WEBHOOK_END = 'datatrans webhook end';

    use \Ecodev\Felix\Repository\Traits\LogRepository;

    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     */
    public function getAccessibleSubQuery(?\Ecodev\Felix\Model\User $user): string
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
