<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
use Application\Model\Booking;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class BookingIsPendingApplication implements NamedAssertion
{
    public function getName(): string
    {
        return 'le réservable est pas encore confirmé';
    }

    /**
     * Assert that a booking is a pending application.
     *
     * @param \Application\Acl\Acl $acl
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, ?RoleInterface $role = null, ?ResourceInterface $resource = null, $privilege = null)
    {
        /** @var Booking $booking */
        $booking = $resource->getInstance();

        $bookable = $booking->getBookable();
        if (!$bookable) {
            return false;
        }

        $bookingType = $bookable->getBookingType();
        if ($booking->getStatus() === BookingStatus::Application && in_array($bookingType, [BookingType::Application, BookingType::AdminApproved], true)) {
            return true;
        }

        return $acl->reject('you cannot delete a processed application');
    }
}
