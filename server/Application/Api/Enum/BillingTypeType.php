<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class BillingTypeType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\BillingTypeType::ELECTRONIC => 'Electronique seulement',
            \Application\DBAL\Types\BillingTypeType::PAPER => 'Electronique et papier',
        ];

        parent::__construct($config);
    }
}
