<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class BookingTypeType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\BookingTypeType::SELF_APPROVED => 'Carnet de sortie',
            \Application\DBAL\Types\BookingTypeType::APPLICATION => 'Stockage et services pour demande',
            \Application\DBAL\Types\BookingTypeType::ADMIN_ASSIGNED => 'Stockage et services effectifs',
            \Application\DBAL\Types\BookingTypeType::MANDATORY => 'Services obligatoires',
        ];

        parent::__construct($config);
    }
}
