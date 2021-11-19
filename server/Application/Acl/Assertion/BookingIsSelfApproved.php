<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\DBAL\Types\BookingTypeType;
use Application\Model\Booking;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Assertion\AssertionInterface;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class BookingIsSelfApproved implements AssertionInterface
{
    /**
     * Assert that booking's bookable is self approved (boats) or has no bookable.
     *
     * @param \Application\Acl\Acl $acl
     * @param RoleInterface $role
     * @param ResourceInterface $resource
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, ?RoleInterface $role = null, ?ResourceInterface $resource = null, $privilege = null)
    {
        /** @var Booking $booking */
        $booking = $resource->getInstance();

        if (!$booking->getBookable()) {
            return true;
        }

        $bookingType = $booking->getBookable()->getBookingType();
        if ($bookingType === BookingTypeType::SELF_APPROVED) {
            return true;
        }

        return $acl->reject('the booking type for this booking is not self approved, but : ' . $bookingType);
    }
}
