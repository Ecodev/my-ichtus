<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Enum\ExpenseClaimStatus;
use Application\Model\ExpenseClaim;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class StatusIsNew implements NamedAssertion
{
    public function getName(): string
    {
        return "la demande n'est pas encore traitée";
    }

    /**
     * Assert that the expense claim is new (not processed yet).
     *
     * @param \Application\Acl\Acl $acl
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, ?RoleInterface $role = null, ?ResourceInterface $resource = null, $privilege = null)
    {
        /** @var ExpenseClaim $expenseClaim */
        $expenseClaim = $resource->getInstance();

        if ($expenseClaim->getStatus() === ExpenseClaimStatus::New) {
            return true;
        }

        return $acl->reject('the expense claim status is not new but instead: ' . $expenseClaim->getStatus()->value);
    }
}
