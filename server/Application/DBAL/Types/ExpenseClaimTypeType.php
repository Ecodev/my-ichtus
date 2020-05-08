<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class ExpenseClaimTypeType extends EnumType
{
    const EXPENSE_CLAIM = 'expenseClaim';
    const REFUND = 'refund';

    protected function getPossibleValues(): array
    {
        return [
            self::EXPENSE_CLAIM,
            self::REFUND,
        ];
    }
}
