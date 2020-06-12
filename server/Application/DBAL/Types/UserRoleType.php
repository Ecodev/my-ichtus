<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Model\User;
use Ecodev\Felix\DBAL\Types\EnumType;

class UserRoleType extends EnumType
{
    protected function getPossibleValues(): array
    {
        return [
            User::ROLE_BOOKING_ONLY,
            User::ROLE_INDIVIDUAL,
            User::ROLE_MEMBER,
            User::ROLE_TRAINER,
            User::ROLE_RESPONSIBLE,
            User::ROLE_ADMINISTRATOR,
        ];
    }
}
