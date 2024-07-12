<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Enum\AccountType;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Money\Money;

class AccountRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    private AccountRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Account::class);
    }

    public function providerGetAccessibleSubQuery(): iterable
    {
        $all = range(10000, 10107);
        yield ['anonymous', []];
        yield ['bookingonly', []];
        yield ['individual', [10096]];
        yield ['member', [10096]];
        yield ['formationresponsible', $all];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }

    public function testOneUserCanHaveOnlyOneAccount(): void
    {
        $this->expectException(UniqueConstraintViolationException::class);
        $this->getEntityManager()->getConnection()->insert('account', ['owner_id' => 1000, 'iban' => uniqid()]);
    }

    public function testGetOrCreate(): void
    {
        $user = new User();
        $user->setFirstName('Foo');
        $user->setLastName('Bar');

        $account = $this->repository->getOrCreate($user);

        self::assertSame($user, $account->getOwner());
        self::assertSame('Foo Bar', $account->getName());
        self::assertSame(AccountType::Liability, $account->getType());
        self::assertSame(20300010, $account->getCode());
        self::assertSame('Acomptes de clients', $account->getParent()->getName());
        self::assertSame($account, $user->getAccount());

        $account2 = $this->repository->getOrCreate($user);
        self::assertSame($account, $account2, 'should return the same account if called more than once for same user');

        $user2 = new User();
        $user2->setFirstName('Alice');
        $user2->setLastName('Stark');

        $account3 = $this->repository->getOrCreate($user2);
        self::assertNotSame($account, $account3, 'creating a second account for a second user should not give same code');
        self::assertNotSame($account->getCode(), $account3->getCode(), 'creating a second account for a second user should not give same code');
        self::assertSame(20300011, $account3->getCode(), 'should have been incremented from maxCode in memory');
    }

    public function testGetOrCreateForTheFirstTime(): void
    {
        $this->getEntityManager()->getConnection()->executeQuery('DELETE FROM transaction');
        $this->getEntityManager()->getConnection()->executeQuery('DELETE FROM account WHERE code LIKE "20300%"');
        $user = new User();

        $account = $this->repository->getOrCreate($user);
        self::assertSame(20300001, $account->getCode());
    }

    public function testGetOrCreateInMemory(): void
    {
        $user = new User();
        $account = new Account();
        $account->setOwner($user);

        $actualAccount = $this->repository->getOrCreate($user);

        self::assertSame($account, $actualAccount, 'should return the in-memory account if existing');
    }

    public function testTotalBalance(): void
    {
        $totalAssets = $this->repository->totalBalanceByType(AccountType::Asset);
        $totalLiabilities = $this->repository->totalBalanceByType(AccountType::Liability);
        $totalRevenue = $this->repository->totalBalanceByType(AccountType::Revenue);
        $totalExpense = $this->repository->totalBalanceByType(AccountType::Expense);
        $totalEquity = $this->repository->totalBalanceByType(AccountType::Equity);

        self::assertTrue(Money::CHF(3518750)->equals($totalAssets));
        self::assertTrue(Money::CHF(6000)->equals($totalLiabilities));
        self::assertTrue(Money::CHF(24000)->equals($totalRevenue));
        self::assertTrue(Money::CHF(11250)->equals($totalExpense));
        self::assertTrue(Money::CHF(3500000)->equals($totalEquity));

        $groupAccount = $this->repository->getOneById(10001); // 2. Passifs
        self::assertSame(AccountType::Group, $groupAccount->getType(), 'is a group');
        self::assertTrue(Money::CHF(0)->equals($groupAccount->getBalance()), 'balance for group account is always 0');
        self::assertTrue(Money::CHF(3506000)->equals($groupAccount->getTotalBalance()), 'total balance for group account should have been computed via DB triggers');

        $otherAccount = $this->repository->getOneById(10025); // 10201. PostFinance
        self::assertNotSame(AccountType::Group, $otherAccount->getType(), 'not a group');
        self::assertTrue(Money::CHF(818750)->equals($otherAccount->getBalance()), 'balance for non-group should have been computed via DB triggers');
        self::assertTrue($otherAccount->getBalance()->equals($otherAccount->getTotalBalance()), 'total balance for non-group should be equal to balance');
    }

    public function testGetOneById(): void
    {
        $account = $this->repository->getOneById(10025); // Poste
        self::assertNotNull($account);
        self::assertSame(10025, $account->getId());
        $this->expectExceptionMessage('Account #-9999 not found');
        $this->repository->getOneById(-9999);
    }

    public function testDeleteAccountOfNonFamilyOwnerWithoutAnyTransactions(): void
    {
        self::assertSame(0, $this->repository->deleteAccountOfNonFamilyOwnerWithoutAnyTransactions(), 'nothing should be deleted from fixture data');
        $connection = $this->getEntityManager()->getConnection();

        $connection->insert('account', [
            'code' => '999001',
        ]);
        self::assertSame(0, $this->repository->deleteAccountOfNonFamilyOwnerWithoutAnyTransactions(), 'orphan account without any owner should not be deleted');

        $connection->insert('account', [
            'code' => '999003',
            'owner_id' => '1008',
        ]);
        self::assertSame(1, $this->repository->deleteAccountOfNonFamilyOwnerWithoutAnyTransactions(), 'account of son (not family owner) without any transactionLine should be deleted');
        self::assertSame(0, $this->repository->deleteAccountOfNonFamilyOwnerWithoutAnyTransactions(), 'nothing left to delete');

        $connection->insert('account', [
            'code' => '999003',
            'owner_id' => '1008',
        ]);
        $accountId = $connection->lastInsertId();

        $connection->insert('transaction_line', [
            'transaction_id' => 8000,
            'credit_id' => $accountId,
        ]);
        $transactionLineId = $connection->lastInsertId();
        self::assertSame(0, $this->repository->deleteAccountOfNonFamilyOwnerWithoutAnyTransactions(), 'same as before, but with transaction to credit, should not delete');

        // Delete temp records
        $connection->delete('transaction_line', ['id' => $transactionLineId]);
        $connection->delete('account', ['id' => $accountId]);

        $connection->insert('account', [
            'code' => '999003',
            'owner_id' => '1008',
        ]);
        $id = $connection->lastInsertId();
        $connection->insert('transaction_line', [
            'transaction_id' => 8000,
            'debit_id' => $id,
        ]);
        self::assertSame(0, $this->repository->deleteAccountOfNonFamilyOwnerWithoutAnyTransactions(), 'same as before, but with transaction to debit, should not delete');
    }

    /**
     * @dataProvider providerGetNextCode
     */
    public function testGetNextCode(?int $parentId, int $expected): void
    {
        $parent = $parentId ? $this->getEntityManager()->getReference(Account::class, $parentId) : null;
        $actual = $this->repository->getNextCodeAvailable($parent);
        self::assertSame($expected, $actual);
    }

    public function providerGetNextCode(): iterable
    {
        yield [null, 10];
        yield [10011, 20300010];
        yield [10007, 8511];
    }
}
