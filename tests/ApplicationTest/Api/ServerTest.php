<?php

declare(strict_types=1);

namespace ApplicationTest\Api;

use Application\Api\Schema;
use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionRepository;
use Application\Repository\UserRepository;
use Ecodev\Felix\Testing\Api\AbstractServer;

class ServerTest extends AbstractServer
{
    /**
     * The repository caches are in memory, so the rollback of the transaction does not undo what a
     * query stored in them.
     */
    protected function tearDown(): void
    {
        /** @var AccountRepository $accountRepository */
        $accountRepository = $this->getEntityManager()->getRepository(Account::class);
        $accountRepository->clearCache();

        /** @var TransactionRepository $transactionRepository */
        $transactionRepository = $this->getEntityManager()->getRepository(Transaction::class);
        $transactionRepository->clearCache();

        parent::tearDown();
    }

    protected function setCurrentUser(?string $login): void
    {
        $user = null;
        if ($login && $login !== 'anonymous') {
            /** @var UserRepository $userRepository */
            $userRepository = $this->getEntityManager()->getRepository(User::class);
            $user = $userRepository->getOneByLoginOrEmail($login);
            self::assertNotNull($user, 'given login must exist in test DB: ' . $login);
        }

        User::setCurrent($user);
    }

    protected function createSchema(): \GraphQL\Type\Schema
    {
        return new Schema();
    }
}
