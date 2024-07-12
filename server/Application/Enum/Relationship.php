<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum Relationship: string implements LocalizedPhpEnumType
{
    case Householder = 'householder';
    case Partner = 'partner';
    case Child = 'child';
    case Parent = 'parent';
    case Sister = 'sister';
    case Brother = 'brother';

    public function getDescription(): string
    {
        return match ($this) {
            self::Householder => 'Chef(e) de famille',
            self::Partner => 'Conjoint',
            self::Child => 'Enfant',
            self::Parent => 'Parent',
            self::Sister => 'Soeur',
            self::Brother => 'Frère',
        };
    }
}
