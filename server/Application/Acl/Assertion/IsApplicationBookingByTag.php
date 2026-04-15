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

class IsApplicationBookingByTag implements NamedAssertion
{
    public function __construct(
        private readonly int $bookableTagId,
    ) {}

    public function getName(): string
    {
        return 'Booking is an application for given tag ' . $this->bookableTagId;
    }

    /**
     * Assert that a booking is a pending application for a bookable with the given tag.
     *
     * Mirrors the BookingService.applicationByTag filter
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

        if ($booking->getStatus() !== BookingStatus::Application) {
            return $acl->reject('Booking is not an application');
        }

        $bookable = $booking->getBookable();
        if (!$bookable) {
            return $acl->reject('Booking has no bookable');
        }

        if (!in_array($bookable->getBookingType(), [BookingType::Application, BookingType::AdminApproved], true)) {
            return $acl->reject('Incompatible bookable bookingType');
        }

        foreach ($bookable->getBookableTags() as $tag) {
            if ($tag->getId() === $this->bookableTagId) {
                return true;
            }
        }

        return $acl->reject('Bookable tag does not match (' . $this->bookableTagId . ')');
    }
}
