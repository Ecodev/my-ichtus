<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\AccountingDocument;
use Application\Model\ExpenseClaim;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Ecodev\Felix\Acl\ModelResource;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class ExpenseClaimStatusIsNew implements NamedAssertion
{
    public function getName(): string
    {
        return "la demande liée n'est pas encore traitée";
    }

    /**
     * Assert that the accounting document's expense claim is new (not processed yet).
     *
     * @param \Application\Acl\Acl $acl
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, ?RoleInterface $role = null, ?ResourceInterface $resource = null, $privilege = null)
    {
        /** @var AccountingDocument $instance */
        $instance = $resource->getInstance();
        $expenseClaim = $instance->getExpenseClaim();

        if (!$expenseClaim) {
            return true;
        }

        $assertion = new StatusIsNew();

        return $assertion->assert($acl, $role, new ModelResource(ExpenseClaim::class, $expenseClaim), $privilege);
    }
}
