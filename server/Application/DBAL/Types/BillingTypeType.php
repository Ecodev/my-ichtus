<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BillingTypeType extends EnumType
{
    final public const ELECTRONIC = 'electronic';
    final public const PAPER = 'paper';

    protected function getPossibleValues(): array
    {
        return [
            self::ELECTRONIC,
            self::PAPER,
        ];
    }
}
