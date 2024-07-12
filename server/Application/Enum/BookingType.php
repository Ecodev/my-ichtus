<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum BookingType: string implements LocalizedPhpEnumType
{
    /**
     * A user assigns and approves his own booking.
     */
    case SelfApproved = 'self_approved';

    /**
     * A user requests an admin to assign and approve an **equivalent** booking.
     */
    case Application = 'application';

    /**
     * An admin assigns and approves a booking **equivalent** to the one requested by a user.
     */
    case AdminAssigned = 'admin_assigned';

    /**
     * A user assigns, but an admin approves, the exact same booking.
     */
    case AdminApproved = 'admin_approved';

    /**
     * The system automatically assigns and approves those bookings upon user registration confirmation.
     */
    case Mandatory = 'mandatory';

    public function getDescription(): string
    {
        return match ($this) {
            self::SelfApproved => 'Carnet de sortie',
            self::Application => 'Stockage et services pour demande',
            self::AdminAssigned => 'Stockage et services effectifs',
            self::AdminApproved => 'Cours',
            self::Mandatory => 'Services obligatoires',
        };
    }
}
