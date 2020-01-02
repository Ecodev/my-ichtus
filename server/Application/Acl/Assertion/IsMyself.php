<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\User;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Assertion\AssertionInterface;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class IsMyself implements AssertionInterface
{
    /**
     * Assert that the user is the current user himself
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
        $user = $resource->getInstance();

        if (User::getCurrent() && User::getCurrent() === $user) {
            return true;
        }

        return $acl->reject('it is not himself');
    }
}
