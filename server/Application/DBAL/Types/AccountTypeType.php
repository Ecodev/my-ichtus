<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class AccountTypeType extends EnumType
{
    final public const ASSET = 'asset';
    final public const LIABILITY = 'liability';
    final public const REVENUE = 'revenue';
    final public const EXPENSE = 'expense';
    final public const EQUITY = 'equity';
    final public const GROUP = 'group';

    protected function getPossibleValues(): array
    {
        return [
            self::ASSET,
            self::LIABILITY,
            self::REVENUE,
            self::EXPENSE,
            self::EQUITY,
            self::GROUP,
        ];
    }
}
