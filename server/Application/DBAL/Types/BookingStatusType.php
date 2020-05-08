<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BookingStatusType extends EnumType
{
    const APPLICATION = 'application';
    const BOOKED = 'booked';
    const PROCESSED = 'processed';

    protected function getPossibleValues(): array
    {
        return [
            self::APPLICATION,
            self::BOOKED,
            self::PROCESSED,
        ];
    }
}
