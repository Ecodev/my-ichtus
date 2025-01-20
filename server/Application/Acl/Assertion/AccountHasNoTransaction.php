<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\Account;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class AccountHasNoTransaction implements NamedAssertion
{
    public function getName(): string
    {
        return "le compte et ses sous-comptes n'ont aucune écritures";
    }

    /**
     * Assert that the account, or any of its subaccounts, have no transaction at all.
     *
     * @param \Application\Acl\Acl $acl
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, ?RoleInterface $role = null, ?ResourceInterface $resource = null, $privilege = null)
    {
        /** @var Account $account */
        $account = $resource->getInstance();

        if (!_em()->getRepository(Account::class)->hasTransaction($account)) {
            return true;
        }

        return $acl->reject('the account, or its sub-accounts, have transaction lines');
    }
}
