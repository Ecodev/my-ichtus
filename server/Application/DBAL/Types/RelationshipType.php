<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class RelationshipType extends EnumType
{
    public const HOUSEHOLDER = 'householder';
    public const PARTNER = 'partner';
    public const CHILD = 'child';
    public const PARENT = 'parent';
    public const SISTER = 'sister';
    public const BROTHER = 'brother';

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
