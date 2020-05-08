<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class SwissWindsurfTypeType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\SwissWindsurfTypeType::ACTIVE => 'Actif',
            \Application\DBAL\Types\SwissWindsurfTypeType::PASSIVE => 'Passif',
        ];

        parent::__construct($config);
    }
}
