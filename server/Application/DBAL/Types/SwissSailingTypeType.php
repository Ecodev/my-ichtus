<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\SwissSailingType;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class SwissSailingTypeType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return SwissSailingType::class;
    }
}
