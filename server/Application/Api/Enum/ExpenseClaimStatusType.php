<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class ExpenseClaimStatusType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\ExpenseClaimStatusType::NEW => 'à traiter',
            \Application\DBAL\Types\ExpenseClaimStatusType::PROCESSING => 'en traitement',
            \Application\DBAL\Types\ExpenseClaimStatusType::PROCESSED => 'traîté',
            \Application\DBAL\Types\ExpenseClaimStatusType::REJECTED => 'refusé',
        ];

        parent::__construct($config);
    }
}
