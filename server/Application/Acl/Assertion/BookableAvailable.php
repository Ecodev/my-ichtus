<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\Booking;
use Application\Model\User;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Assertion\AssertionInterface;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class BookableAvailable implements AssertionInterface
{
    /**
     * Assert that the bookable of the given booking can be rented by the current user.
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
        /** @var null|Booking $booking */
        $booking = $resource->getInstance();

        if (!$booking) {
            return $acl->reject('the booking does not exist');
        }

        if (!User::getCurrent()) {
            return $acl->reject('the user is not logged in');
        }

        $bookable = $booking->getBookable();

        if (!$bookable) {
            // Booking using user's own equipment is always allowed
            return true;
        }

        if (!$bookable->isActive()) {
            return $acl->reject('the bookable is not active');
        }

        // Check that the user has ALL required licenses for the bookable
        if (!$bookable->getLicenses()->isEmpty() && User::getCurrent()->getRole() !== User::ROLE_BOOKING_ONLY) {
            $userLicenses = User::getCurrent()->getLicenses();

            foreach ($bookable->getLicenses() as $requiredLicense) {
                if (!$userLicenses->contains($requiredLicense)) {
                    return $acl->reject('the user does not have the required license: ' . $requiredLicense->getName());
                }
            }
        }

        if ($bookable->getSimultaneousBookingMaximum() > 0) {
            // Check that the bookable has no more running bookings than its maximum
            $runningBookings = _em()->getRepository(Booking::class)->findBy([
                'bookable' => $bookable,
                'endDate' => null,
            ]);

            $count = count($runningBookings);
            if ($count >= $bookable->getSimultaneousBookingMaximum()) {
                return $acl->reject('the bookable limit of simultaneous bookings has been reached: ' . $count . '/' . $bookable->getSimultaneousBookingMaximum());
            }
        }

        return true;
    }
}
