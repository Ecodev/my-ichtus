<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class AccountTypeType extends EnumType
{
    public const ASSET = 'asset';
    public const LIABILITY = 'liability';
    public const REVENUE = 'revenue';
    public const EXPENSE = 'expense';
    public const EQUITY = 'equity';
    public const GROUP = 'group';

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
