<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\DBAL\Types\BookingTypeType;
use Application\Model\Bookable;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Assertion\AssertionInterface;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class BookableIsAdminApproved implements AssertionInterface
{
    /**
     * Assert that the bookable's booking type is admin approved
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
        if ($resource === null) {
            return false;
        }

        /** @var Bookable $bookable */
        $bookable = $resource->getInstance();

        $bookingType = $bookable->getBookingType();
        if ($bookingType === BookingTypeType::ADMIN_APPROVED) {
            return true;
        }

        return $acl->reject('the booking type for this bookable is not admin approved, but : ' . $bookingType);
    }
}
