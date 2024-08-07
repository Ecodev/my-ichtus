<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Enum\BookingType;
use Application\Model\Bookable;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class BookableIsAdminApproved implements NamedAssertion
{
    public function getName(): string
    {
        return 'le réservable est un cours';
    }

    /**
     * Assert that the bookable's booking type is admin approved.
     *
     * @param \Application\Acl\Acl $acl
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
        if ($bookingType === BookingType::AdminApproved) {
            return true;
        }

        return $acl->reject('the booking type for this bookable is not admin approved, but : ' . $bookingType->value);
    }
}
