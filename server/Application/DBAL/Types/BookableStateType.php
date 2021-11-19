<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BookableStateType extends EnumType
{
    public const GOOD = 'good';
    public const USED = 'used';
    public const DEGRADED = 'degraded';

    protected function getPossibleValues(): array
    {
        return [
            self::GOOD,
            self::USED,
            self::DEGRADED,
        ];
    }
}
