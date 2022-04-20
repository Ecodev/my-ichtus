<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\AbstractModel;
use Application\Model\User;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class IsFamily implements NamedAssertion
{
    public function getName(): string
    {
        return "l'objet appartient à mon ménage";
    }

    /**
     * Assert that the object belongs to someone in the current user family.
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

        /** @var AbstractModel $object */
        $object = $resource->getInstance();

        $currentFamilyOwner = User::getCurrent();
        if ($currentFamilyOwner && $currentFamilyOwner->getOwner()) {
            $currentFamilyOwner = $currentFamilyOwner->getOwner();
        }

        $objectFamilyOwner = $object->getOwner();
        if ($objectFamilyOwner && $objectFamilyOwner->getOwner()) {
            $objectFamilyOwner = $objectFamilyOwner->getOwner();
        }

        if ($currentFamilyOwner && $currentFamilyOwner === $objectFamilyOwner) {
            return true;
        }

        return $acl->reject('the object does not belong to the family');
    }
}
