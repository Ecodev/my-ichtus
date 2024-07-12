<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\BookingType;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class BookingTypeType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return BookingType::class;
    }
}
