<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BookableStateType extends EnumType
{
    const GOOD = 'good';
    const USED = 'used';
    const DEGRADED = 'degraded';

    protected function getPossibleValues(): array
    {
        return [
            self::GOOD,
            self::USED,
            self::DEGRADED,
        ];
    }
}
