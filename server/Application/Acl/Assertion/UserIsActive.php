<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\User;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class UserIsActive implements NamedAssertion
{
    public function getName(): string
    {
        return "l'utilisateur est actif";
    }

    /**
     * Assert that the current user is active.
     *
     * @param \Application\Acl\Acl $acl
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, ?RoleInterface $role = null, ?ResourceInterface $resource = null, $privilege = null)
    {
        $currentUser = User::getCurrent();
        if ($currentUser && $currentUser->getStatus() === User::STATUS_ACTIVE) {
            return true;
        }

        return $acl->reject('the current user is not active');
    }
}
