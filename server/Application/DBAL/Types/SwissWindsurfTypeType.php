<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\SwissWindsurfType;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class SwissWindsurfTypeType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return SwissWindsurfType::class;
    }
}
