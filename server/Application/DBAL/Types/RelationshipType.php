<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class RelationshipType extends EnumType
{
    const HOUSEHOLDER = 'householder';
    const PARTNER = 'partner';
    const CHILD = 'child';
    const PARENT = 'parent';
    const SISTER = 'sister';
    const BROTHER = 'brother';

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
