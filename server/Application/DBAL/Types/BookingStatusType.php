<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Application\Enum\BookingStatus;
use Ecodev\Felix\DBAL\Types\PhpEnumType;

class BookingStatusType extends PhpEnumType
{
    protected function getEnumType(): string
    {
        return BookingStatus::class;
    }
}
