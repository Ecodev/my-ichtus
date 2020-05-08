<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class BookingStatusType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\BookingStatusType::APPLICATION => 'Demande en attente',
            \Application\DBAL\Types\BookingStatusType::PROCESSED => 'Demande traitée',
            \Application\DBAL\Types\BookingStatusType::BOOKED => 'Réservation',
        ];

        parent::__construct($config);
    }
}
