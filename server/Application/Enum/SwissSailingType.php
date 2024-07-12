<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum SwissSailingType: string implements LocalizedPhpEnumType
{
    case Active = 'active';
    case Passive = 'passive';
    case Junior = 'junior';

    public function getDescription(): string
    {
        return match ($this) {
            self::Active => 'Actif',
            self::Passive => 'Passif',
            self::Junior => 'Junior',
        };
    }
}
