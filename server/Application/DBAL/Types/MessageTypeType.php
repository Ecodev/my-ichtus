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

    protected function getPossibleValues(): array
    {
        return [
            self::REGISTER,
            self::UNREGISTER,
            self::RESET_PASSWORD,
            self::BALANCE,
        ];
    }
}
