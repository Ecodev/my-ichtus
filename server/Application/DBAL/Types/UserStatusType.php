<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\UserStatus;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class UserStatusType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return UserStatus::class;
    }
}
