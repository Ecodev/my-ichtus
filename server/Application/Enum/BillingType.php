<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum BillingType: string implements LocalizedPhpEnumType
{
    case Electronic = 'electronic';
    case Paper = 'paper';

    public function getDescription(): string
    {
        return match ($this) {
            self::Electronic => 'Electronique seulement',
            self::Paper => 'Electronique et papier',
        };
    }
}
