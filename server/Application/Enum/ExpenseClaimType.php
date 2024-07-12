<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum ExpenseClaimType: string implements LocalizedPhpEnumType
{
    case ExpenseClaim = 'expenseClaim';
    case Refund = 'refund';
    case Invoice = 'invoice';

    public function getDescription(): string
    {
        return match ($this) {
            self::ExpenseClaim => 'Dépense',
            self::Refund => 'Remboursement',
            self::Invoice => 'Facture à payer',
        };
    }
}
