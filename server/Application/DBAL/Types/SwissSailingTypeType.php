<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class SwissSailingTypeType extends EnumType
{
    final public const ACTIVE = 'active';
    final public const PASSIVE = 'passive';
    final public const JUNIOR = 'junior';

    protected function getPossibleValues(): array
    {
        return [
            self::ACTIVE,
            self::PASSIVE,
            self::JUNIOR,
        ];
    }
}
