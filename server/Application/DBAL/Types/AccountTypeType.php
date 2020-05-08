<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class AccountTypeType extends EnumType
{
    const ASSET = 'asset';
    const LIABILITY = 'liability';
    const REVENUE = 'revenue';
    const EXPENSE = 'expense';
    const EQUITY = 'equity';
    const GROUP = 'group';

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
