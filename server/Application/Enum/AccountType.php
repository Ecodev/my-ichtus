<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum AccountType: string implements LocalizedPhpEnumType
{
    case Asset = 'asset';
    case Liability = 'liability';
    case Revenue = 'revenue';
    case Expense = 'expense';
    case Equity = 'equity';
    case Group = 'group';

    public function getDescription(): string
    {
        return match ($this) {
            self::Asset => 'Actif',
            self::Liability => 'Passif',
            self::Revenue => 'Produit',
            self::Expense => 'Charge',
            self::Equity => 'Résultat',
            self::Group => 'Groupe',
        };
    }
}
