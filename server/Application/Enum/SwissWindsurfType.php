<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum SwissWindsurfType: string implements LocalizedPhpEnumType
{
    case Active = 'active';
    case Passive = 'passive';

    public function getDescription(): string
    {
        return match ($this) {
            self::Active => 'Actif',
            self::Passive => 'Passif',
        };
    }
}
