<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\User;
use Application\Model\UserTag;

use Ecodev\Felix\Repository\LimitedAccessSubQuery;

/**
 * @extends AbstractRepository<UserTag>
 */
class UserTagRepository extends AbstractRepository implements LimitedAccessSubQuery
{
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

        if (in_array($user->getRole(), [User::ROLE_TRAINER, User::ROLE_FORMATION_RESPONSIBLE, User::ROLE_RESPONSIBLE, User::ROLE_ADMINISTRATOR], true)) {
            return '';
        }

        return '-1';
    }
}
