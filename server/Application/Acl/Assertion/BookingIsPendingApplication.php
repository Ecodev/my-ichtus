<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\BookingTypeType;
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
        if ($booking->getStatus() === BookingStatusType::APPLICATION && in_array($bookingType, [BookingTypeType::APPLICATION, BookingTypeType::ADMIN_APPROVED], true)) {
            return true;
        }

        return $acl->reject('you cannot delete a processed application');
    }
}
