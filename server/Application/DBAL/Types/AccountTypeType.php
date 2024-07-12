<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\AccountType;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class AccountTypeType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return AccountType::class;
    }
}
