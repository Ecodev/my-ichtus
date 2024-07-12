<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum UserStatus: string implements LocalizedPhpEnumType
{
    case Inactive = 'inactive';
    case New = 'new';
    case Active = 'active';
    case Archived = 'archived';

    public function getDescription(): string
    {
        return match ($this) {
            self::New => 'Nouveau',
            self::Active => 'Actif',
            self::Inactive => 'Inactif',
            self::Archived => 'Archivé',
        };
    }
}
