<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class ExpenseClaimTypeType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\ExpenseClaimTypeType::EXPENSE_CLAIM => 'Dépense',
            \Application\DBAL\Types\ExpenseClaimTypeType::REFUND => 'Remboursement',
        ];
        parent::__construct($config);
    }
}
