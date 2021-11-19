<?php

declare(strict_types=1);

namespace ApplicationTest\Traits;

use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Ecodev\Felix\Testing\Traits\TestWithTransaction;

/**
 * Allow to run test within a database transaction, so database will be unchanged after test.
 */
trait TestWithTransactionAndUser
{
    use TestWithTransaction {
        setUp as traitSetupWithTransaction;
        tearDown as traitTearDownWithTransaction;
    }

    /**
     * Start transaction.
     */
    protected function setUp(): void
    {
        $this->traitSetupWithTransaction();
        User::setCurrent(null);
    }

    /**
     * Cancel transaction, to undo all changes made.
     */
    protected function tearDown(): void
    {
        User::setCurrent(null);

        /** @var AccountRepository $accountRepository */
        $accountRepository = $this->getEntityManager()->getRepository(Account::class);
        $accountRepository->clearCache();

        $this->traitTearDownWithTransaction();
    }
}
