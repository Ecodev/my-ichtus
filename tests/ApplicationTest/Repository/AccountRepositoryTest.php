<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;

/**
 * @group Repository
 */
class AccountRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    /**
     * @var AccountRepository
     */
    private $repository;

    public function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Account::class);
    }

    public function providerGetAccessibleSubQuery(): array
    {
        $all = range(10000, 10106);

        return [
            ['anonymous', []],
            ['bookingonly', []],
            ['individual', [10097]],
            ['member', [10096]],
            ['responsible', $all],
            ['administrator', $all],
        ];
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
        self::assertSame(AccountTypeType::LIABILITY, $account->getType());
        self::assertSame('20300009', $account->getCode());
        self::assertSame('Acomptes de clients', $account->getParent()->getName());
        self::assertSame($account, $user->getAccount());

        $account2 = $this->repository->getOrCreate($user);
        self::assertSame($account, $account2, 'should return the same one if called more than once');
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
        $this->repository->clearCache();

        $totalAssets = $this->repository->totalBalanceByType(AccountTypeType::ASSET);
        $totalLiabilities = $this->repository->totalBalanceByType(AccountTypeType::LIABILITY);
        $totalRevenue = $this->repository->totalBalanceByType(AccountTypeType::REVENUE);
        $totalExpense = $this->repository->totalBalanceByType(AccountTypeType::EXPENSE);
        $totalEquity = $this->repository->totalBalanceByType(AccountTypeType::EQUITY);

        self::assertEquals(35187.50, $totalAssets);
        self::assertEquals(60, $totalLiabilities);
        self::assertEquals(240, $totalRevenue);
        self::assertEquals(112.50, $totalExpense);
        self::assertEquals(35000, $totalEquity);

        User::setCurrent(new User(User::ROLE_ADMINISTRATOR));

        $groupAccount = $this->repository->findOneByCode('2'); // 2. Passifs
        $totalPassifs = $this->repository->totalBalanceByParent($groupAccount);
        self::assertEquals(35060, $totalPassifs);
        self::assertEquals($groupAccount->getBalance(), $totalPassifs);

        // Total balance can be computed only for accounts of type group
        $otherAccount = $this->repository->findOneById('10023'); // 1000. Caisse
        $this->expectExceptionMessage('Cannot compute total balance for Account #10023 of type asset');
        $this->repository->totalBalanceByParent($otherAccount);
    }
}
