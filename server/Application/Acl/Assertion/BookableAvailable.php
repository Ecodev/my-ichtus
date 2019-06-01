<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\Booking;
use Application\Model\User;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Assertion\AssertionInterface;
use Zend\Permissions\Acl\Resource\ResourceInterface;
use Zend\Permissions\Acl\Role\RoleInterface;

class BookableAvailable implements AssertionInterface
{
    /**
     * Assert that the bookable of the given booking can be rented by the current user
     *
     * @param Acl $acl
     * @param RoleInterface $role
     * @param ResourceInterface $resource
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, RoleInterface $role = null, ResourceInterface $resource = null, $privilege = null)
    {
        $booking = $resource->getInstance();

        if (!$booking) {
            return false;
        }

        if (!User::getCurrent()) {
            return false;
        }

        $bookable = $booking->getBookable();

        if (!$bookable) {
            // Booking using user's own equipment is always allowed
            return true;
        }

        if (!$bookable->isActive()) {
            return false;
        }

        // Check that the user has ALL required licenses for the bookable
        if (!$bookable->getLicenses()->isEmpty() && User::getCurrent()->getRole() !== User::ROLE_BOOKING_ONLY) {
            $userLicenses = User::getCurrent()->getLicenses();

            foreach ($bookable->getLicenses() as $requiredLicense) {
                if (!$userLicenses->contains($requiredLicense)) {
                    return false;
                }
            }
        }

        if ($bookable->getSimultaneousBookingMaximum() > 0) {
            // Check that the bookable has no more running bookings than its maximum
            $runningBookings = _em()->getRepository(Booking::class)->findBy([
                'bookable' => $bookable,
                'endDate' => null,
            ]);

            if (count($runningBookings) >= $bookable->getSimultaneousBookingMaximum()) {
                return false;
            }
        }

        return true;
    }
}
