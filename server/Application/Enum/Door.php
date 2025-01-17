<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum Door: string implements LocalizedPhpEnumType
{
    case Door1 = 'door1';
    case Door2 = 'door2';
    case Door3 = 'door3';
    case Door4 = 'door4';

    public function getDescription(): string
    {
        return match ($this) {
            self::Door1 => 'Entrée nord',
            self::Door2 => 'Entrée plage',
            self::Door3 => 'Vestibule',
            self::Door4 => 'Local technique',
        };
    }
}
