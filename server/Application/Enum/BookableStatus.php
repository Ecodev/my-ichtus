<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum BookableStatus: string implements LocalizedPhpEnumType
{
    case New = 'new';
    case Active = 'active';
    case Inactive = 'inactive';
    case Archived = 'archived';

    public function getDescription(): string
    {
        return match ($this) {
            self::New => _tr('Nouveau'),
            self::Active => _tr('Actif'),
            self::Inactive => _tr('Inactif'),
            self::Archived => _tr('Archivé'),
        };
    }
}
