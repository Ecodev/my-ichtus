<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\AbstractModel;
use Application\Model\User;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Assertion\AssertionInterface;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class IsOwner implements AssertionInterface
{
    /**
     * Assert that the object belongs to the current user
     *
     * @param \Application\Acl\Acl $acl
     * @param RoleInterface $role
     * @param ResourceInterface $resource
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, RoleInterface $role = null, ResourceInterface $resource = null, $privilege = null)
    {
        /** @var AbstractModel $object */
        $object = $resource->getInstance();

        if (User::getCurrent() && User::getCurrent() === $object->getOwner()) {
            return true;
        }

        return $acl->reject('the object does not belong to the user');
    }
}
