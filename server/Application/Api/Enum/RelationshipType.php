<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class RelationshipType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\RelationshipType::HOUSEHOLDER => 'Chef(e) de famille',
            \Application\DBAL\Types\RelationshipType::PARTNER => 'Conjoint',
            \Application\DBAL\Types\RelationshipType::CHILD => 'Enfant',
            \Application\DBAL\Types\RelationshipType::PARENT => 'Parent',
            \Application\DBAL\Types\RelationshipType::SISTER => 'Soeur',
            \Application\DBAL\Types\RelationshipType::BROTHER => 'Frère',
        ];

        parent::__construct($config);
    }
}
