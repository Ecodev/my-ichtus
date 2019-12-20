<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Money\Money;

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
        self::assertSame(20300009, $account->getCode());
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

        self::assertTrue(Money::CHF(3518750)->equals($totalAssets));
        self::assertTrue(Money::CHF(6000)->equals($totalLiabilities));
        self::assertTrue(Money::CHF(24000)->equals($totalRevenue));
        self::assertTrue(Money::CHF(11250)->equals($totalExpense));
        self::assertTrue(Money::CHF(3500000)->equals($totalEquity));

        User::setCurrent(new User(User::ROLE_ADMINISTRATOR));

        $groupAccount = $this->repository->findOneByCode(2); // 2. Passifs
        $totalPassifs = $this->repository->totalBalanceByParent($groupAccount);
        self::assertTrue(Money::CHF(3506000)->equals($totalPassifs));
        self::assertEquals($groupAccount->getBalance(), $totalPassifs);

        $totalPassifsCached = $this->repository->totalBalanceByParent($groupAccount);
        self::assertSame($totalPassifs, $totalPassifsCached, 'should return exactly same from cache');

        // Total balance can be computed only for accounts of type group
        $otherAccount = $this->repository->findOneById('10023'); // 1000. Caisse
        $this->expectExceptionMessage('Cannot compute total balance for Account #10023 of type asset');
        $this->repository->totalBalanceByParent($otherAccount);
    }

    public function testGetOneById(): void
    {
        $account = $this->repository->getOneById(10025); // Poste
        self::assertNotNull($account);
        self::assertSame(10025, $account->getId());
        $this->expectExceptionMessage('Account #-9999 not found');
        $this->repository->getOneById(-9999);
    }
}
