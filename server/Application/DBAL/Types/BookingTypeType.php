<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BookingTypeType extends EnumType
{
    const SELF_APPROVED = 'self_approved';
    const APPLICATION = 'application';
    const ADMIN_ASSIGNED = 'admin_assigned';
    const MANDATORY = 'mandatory';

    protected function getPossibleValues(): array
    {
        return [
            self::SELF_APPROVED,
            self::APPLICATION,
            self::ADMIN_ASSIGNED,
            self::MANDATORY,
        ];
    }
}
