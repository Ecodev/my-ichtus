<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class SwissWindsurfTypeType extends EnumType
{
    final public const ACTIVE = 'active';
    final public const PASSIVE = 'passive';

    protected function getPossibleValues(): array
    {
        return [
            self::ACTIVE,
            self::PASSIVE,
        ];
    }
}
