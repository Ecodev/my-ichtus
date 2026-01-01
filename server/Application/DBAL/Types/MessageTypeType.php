<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class MessageTypeType extends EnumType
{
    final public const string REGISTER = 'register';
    final public const string UNREGISTER = 'unregister';
    final public const string RESET_PASSWORD = 'reset_password';
    final public const string BALANCE = 'balance';
    final public const string LEAVE_FAMILY = 'leave_family';
    final public const string ADMIN_LEAVE_FAMILY = 'admin_leave_family';
    final public const string REQUEST_USER_DELETION = 'request_user_deletion';

    protected function getPossibleValues(): array
    {
        return [
            self::REGISTER,
            self::UNREGISTER,
            self::RESET_PASSWORD,
            self::BALANCE,
            self::LEAVE_FAMILY,
            self::ADMIN_LEAVE_FAMILY,
            self::REQUEST_USER_DELETION,
        ];
    }
}
