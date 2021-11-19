<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class MessageTypeType extends EnumType
{
    public const REGISTER = 'register';
    public const UNREGISTER = 'unregister';
    public const RESET_PASSWORD = 'reset_password';
    public const BALANCE = 'balance';

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
