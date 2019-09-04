<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\User;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Assertion\AssertionInterface;
use Zend\Permissions\Acl\Resource\ResourceInterface;
use Zend\Permissions\Acl\Role\RoleInterface;

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
