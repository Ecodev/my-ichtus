<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum BookingStatus: string implements LocalizedPhpEnumType
{
    case Application = 'application';
    case Booked = 'booked';
    case Processed = 'processed';

    public function getDescription(): string
    {
        return match ($this) {
            self::Application => 'Demande en attente',
            self::Processed => 'Demande traitée',
            self::Booked => 'Réservation',
        };
    }
}
