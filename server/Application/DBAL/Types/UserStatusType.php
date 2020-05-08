<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Model\User;
use Ecodev\Felix\DBAL\Types\EnumType;

class UserStatusType extends EnumType
{
    protected function getPossibleValues(): array
    {
        return [
            User::STATUS_INACTIVE,
            User::STATUS_ACTIVE,
            User::STATUS_NEW,
            User::STATUS_ARCHIVED,
        ];
    }
}
