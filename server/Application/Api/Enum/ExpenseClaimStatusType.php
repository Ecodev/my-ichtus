<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class ExpenseClaimStatusType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\ExpenseClaimStatusType::NEW => 'À traiter',
            \Application\DBAL\Types\ExpenseClaimStatusType::PROCESSING => 'En traitement',
            \Application\DBAL\Types\ExpenseClaimStatusType::PROCESSED => 'Traîté',
            \Application\DBAL\Types\ExpenseClaimStatusType::REJECTED => 'Refusé',
        ];

        parent::__construct($config);
    }
}
