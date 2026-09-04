<?php

declare(strict_types=1);

namespace Application\Acl\Assertion;

use Application\Model\Transaction;
use Application\Repository\TransactionRepository;
use Ecodev\Felix\Acl\Assertion\NamedAssertion;
use Laminas\Permissions\Acl\Acl;
use Laminas\Permissions\Acl\Resource\ResourceInterface;
use Laminas\Permissions\Acl\Role\RoleInterface;

class TransactionIsNotClosed implements NamedAssertion
{
    public function getName(): string
    {
        return "la transaction n'est pas plus vieille que le dernier bouclement comptable";
    }

    /**
     * @param \Application\Acl\Acl $acl
     * @param string $privilege
     *
     * @return bool
     */
    public function assert(Acl $acl, ?RoleInterface $role = null, ?ResourceInterface $resource = null, $privilege = null)
    {
        if (!$resource) {
            return false;
        }

        /** @var Transaction $transaction */
        $transaction = $resource->getInstance();

        /** @var TransactionRepository $transactionRepository */
        $transactionRepository = _em()->getRepository(Transaction::class);

        if (!$transactionRepository->isClosed($transaction)) {
            return true;
        }

        return $acl->reject('the transaction belongs to a closed accounting period');
    }
}
