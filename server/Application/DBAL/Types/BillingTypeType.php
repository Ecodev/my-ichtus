<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\BillingType;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class BillingTypeType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return BillingType::class;
    }
}
