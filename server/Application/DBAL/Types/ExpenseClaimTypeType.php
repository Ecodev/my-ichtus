<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class ExpenseClaimTypeType extends EnumType
{
    public const EXPENSE_CLAIM = 'expenseClaim';
    public const REFUND = 'refund';
    public const INVOICE = 'invoice';

    protected function getPossibleValues(): array
    {
        return [
            self::EXPENSE_CLAIM,
            self::REFUND,
            self::INVOICE,
        ];
    }
}
