<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\ExpenseClaimType;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class ExpenseClaimTypeType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return ExpenseClaimType::class;
    }
}
