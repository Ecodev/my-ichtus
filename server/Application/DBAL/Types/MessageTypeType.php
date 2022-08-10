<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class MessageTypeType extends EnumType
{
    final public const REGISTER = 'register';
    final public const UNREGISTER = 'unregister';
    final public const RESET_PASSWORD = 'reset_password';
    final public const BALANCE = 'balance';
    final public const LEAVE_FAMILY = 'leave_family';
    final public const ADMIN_LEAVE_FAMILY = 'admin_leave_family';

    protected function getPossibleValues(): array
    {
        return [
            self::REGISTER,
            self::UNREGISTER,
            self::RESET_PASSWORD,
            self::BALANCE,
            self::LEAVE_FAMILY,
            self::ADMIN_LEAVE_FAMILY,
        ];
    }
}
