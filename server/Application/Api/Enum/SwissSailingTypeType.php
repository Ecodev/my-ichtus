<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class SwissSailingTypeType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\SwissSailingTypeType::ACTIVE => 'Actif',
            \Application\DBAL\Types\SwissSailingTypeType::PASSIVE => 'Passif',
            \Application\DBAL\Types\SwissSailingTypeType::JUNIOR => 'Junior',
        ];

        parent::__construct($config);
    }
}
