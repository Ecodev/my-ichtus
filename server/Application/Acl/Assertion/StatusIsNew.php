<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\DBAL\Types\ExpenseClaimStatusType;
use Application\Model\ExpenseClaim;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Assertion\AssertionInterface;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class StatusIsNew implements AssertionInterface
{
    /**
     * Assert that the expense claim is new (not processed yet)
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
        /** @var ExpenseClaim $expenseClaim */
        $expenseClaim = $resource->getInstance();

        if ($expenseClaim->getStatus() === ExpenseClaimStatusType::NEW) {
            return true;
        }

        return $acl->reject('the expense claim status is not new but instead: ' . $expenseClaim->getStatus());
    }
}
