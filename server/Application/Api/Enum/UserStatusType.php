<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Application\Model\User;
use Ecodev\Felix\Api\Enum\EnumType;

class UserStatusType extends EnumType
{
    public function __construct()
    {
        $config = [
            User::STATUS_NEW => 'Nouveau',
            User::STATUS_ACTIVE => 'Actif',
            User::STATUS_INACTIVE => 'Inactif',
            User::STATUS_ARCHIVED => 'Archivé',
        ];

        parent::__construct($config);
    }
}
