<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\Relationship;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class RelationshipType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return Relationship::class;
    }
}
