<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum BookableState: string implements LocalizedPhpEnumType
{
    case Good = 'good';
    case Used = 'used';
    case Degraded = 'degraded';

    public function getDescription(): string
    {
        return match ($this) {
            self::Good => 'Bon',
            self::Used => 'Usagé',
            self::Degraded => 'Dégradé',
        };
    }
}
