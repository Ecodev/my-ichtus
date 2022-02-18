<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BookableStateType extends EnumType
{
    final public const GOOD = 'good';
    final public const USED = 'used';
    final public const DEGRADED = 'degraded';

    protected function getPossibleValues(): array
    {
        return [
            self::GOOD,
            self::USED,
            self::DEGRADED,
        ];
    }
}
