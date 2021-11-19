<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BookingStatusType extends EnumType
{
    public const APPLICATION = 'application';
    public const BOOKED = 'booked';
    public const PROCESSED = 'processed';

    protected function getPossibleValues(): array
    {
        return [
            self::APPLICATION,
            self::BOOKED,
            self::PROCESSED,
        ];
    }
}
