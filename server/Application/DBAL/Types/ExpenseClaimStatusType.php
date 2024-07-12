<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\ExpenseClaimStatus;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class ExpenseClaimStatusType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return ExpenseClaimStatus::class;
    }
}
