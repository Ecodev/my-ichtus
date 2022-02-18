<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class RelationshipType extends EnumType
{
    final public const HOUSEHOLDER = 'householder';
    final public const PARTNER = 'partner';
    final public const CHILD = 'child';
    final public const PARENT = 'parent';
    final public const SISTER = 'sister';
    final public const BROTHER = 'brother';

    protected function getPossibleValues(): array
    {
        return [
            self::HOUSEHOLDER,
            self::PARTNER,
            self::CHILD,
            self::PARENT,
            self::SISTER,
            self::BROTHER,
        ];
    }
}
