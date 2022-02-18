<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class BookingTypeType extends EnumType
{
    /**
     * A user assigns and approves his own booking.
     */
    final public const SELF_APPROVED = 'self_approved';

    /**
     * A user requests an admin to assign and approve an **equivalent** booking.
     */
    final public const APPLICATION = 'application';

    /**
     * An admin assigns and approves a booking **equivalent** to the one requested by a user.
     */
    final public const ADMIN_ASSIGNED = 'admin_assigned';

    /**
     * A user assigns, but an admin approves, the exact same booking.
     */
    final public const ADMIN_APPROVED = 'admin_approved';

    /**
     * The system automatically assigns and approves those bookings upon user registration confirmation.
     */
    final public const MANDATORY = 'mandatory';

    protected function getPossibleValues(): array
    {
        return [
            self::SELF_APPROVED,
            self::APPLICATION,
            self::ADMIN_ASSIGNED,
            self::ADMIN_APPROVED,
            self::MANDATORY,
        ];
    }
}
