<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\BookableState;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class BookableStateType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return BookableState::class;
    }
}
