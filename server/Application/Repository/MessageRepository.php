<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\Message;

use Ecodev\Felix\Repository\LimitedAccessSubQuery;

/**
 * @extends AbstractRepository<Message>
 */
class MessageRepository extends AbstractRepository implements \Ecodev\Felix\Repository\MessageRepository, LimitedAccessSubQuery
{
    use \Ecodev\Felix\Repository\Traits\MessageRepository;

    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     */
    public function getAccessibleSubQuery(?\Ecodev\Felix\Model\User $user): string
    {
        if (!$user) {
            return '-1';
        }

        return 'SELECT id FROM message WHERE recipient_id = ' . $user->getId();
    }
}
