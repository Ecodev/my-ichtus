<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Enum\AccountType;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Cake\Chronos\Chronos;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Money\Money;
use PHPUnit\Framework\Attributes\DataProvider;

class AccountRepositoryTest extends AbstractRepository
{
    use LimitedAccessSubQuery;

    private AccountRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Account::class);
    }

    public static function providerGetAccessibleSubQuery(): iterable
    {
        $all = range(10000, 10109);
        yield ['anonymous', []];
        yield ['bookingonly', []];
        yield ['individual', [10096, 10108]];
        yield ['member', [10096, 10108]];
        yield ['formationresponsible', $all];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }

    public function testOneUserCanHaveOnlyOneAccount(): void
    {
        $this->expectException(UniqueConstraintViolationException::class);
        $this->getEntityManager()->getConnection()->insert('account', ['owner_id' => 1000, 'iban' => uniqid(), 'code' => 99999]);
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
        $parent = $account->getParent();
        self::assertNotNull($parent);
        self::assertSame('Acomptes de clients', $parent->getName());
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
        self::assertTrue(Money::CHF(3506000)->equals($totalLiabilities));
        self::assertTrue(Money::CHF(24000)->equals($totalRevenue));
        self::assertTrue(Money::CHF(11250)->equals($totalExpense));
        self::assertTrue(Money::CHF(0)->equals($totalEquity));

        $groupAccount = $this->repository->getOneById(10001); // 2. Passifs
        self::assertSame(AccountType::Group, $groupAccount->getType(), 'is a group');
        self::assertTrue(Money::CHF(0)->equals($groupAccount->getBalance()), 'balance for group account is always 0');
        $groupTotalBalance = $groupAccount->getTotalBalance();
        self::assertNotNull($groupTotalBalance);
        self::assertTrue(Money::CHF(3506000)->equals($groupTotalBalance), 'total balance for group account should have been computed via DB triggers');

        $otherAccount = $this->repository->getOneById(10025); // 10201. PostFinance
        self::assertNotSame(AccountType::Group, $otherAccount->getType(), 'not a group');
        self::assertTrue(Money::CHF(818750)->equals($otherAccount->getBalance()), 'balance for non-group should have been computed via DB triggers');
        $otherTotalBalance = $otherAccount->getTotalBalance();
        self::assertNotNull($otherTotalBalance);
        self::assertTrue($otherAccount->getBalance()->equals($otherTotalBalance), 'total balance for non-group should be equal to balance');
    }

    // ex-future = transaction that past from future to past.
    public function testCronUpdatesExFutureTransactionBalance(): void
    {
        $connection = $this->getEntityManager()->getConnection();

        $transactionDate = new Chronos($connection->fetchOne('SELECT transaction_date FROM transaction_line WHERE id = 14013'));
        self::assertTrue($transactionDate->greaterThan(Chronos::now()), 'fixture transaction must stay dated in the future for this test to be meaningful');

        // 8500: Charges extraordinaires, exceptionnelles ou hors période (would be 5000 if the future transaction were wrongly included)
        $this->assertAccountBalance(10102, 0, 'balance must exclude the transaction dated in the future');
        $this->assertAccountTotalBalance(10007, 0, 'group total must exclude the transaction dated in the future'); // 8: Résultats extraordinaires et hors exploitation

        // Easiest way to grant update_account_balance excludes the future is to recompute them all (acceptable on fixtures).
        $this->repository->updateAccountsBalance();
        $this->assertAccountBalance(10102, 0, 'explicit recompute must also exclude the transaction dated in the future');

        // Move the future transaction into the past. Changing only the date does not change balance
        $connection->update('transaction_line', ['transaction_date' => Chronos::yesterday()], ['id' => 14013]);
        $this->assertAccountBalance(10102, 0, 'balance stays stale after the date alone changes, with no explicit recompute');

        $this->repository->updateAccountsBalance();
        $this->assertAccountBalance(10102, 5000, 'once dated in the past, the transaction must be added to the balance on next recompute');
        $this->assertAccountTotalBalance(10007, 5000, 'group total must include it too');
    }

    public function testTriggerUpdatesExFutureTransactionBalance(): void
    {
        $connection = $this->getEntityManager()->getConnection();

        // 8500: Charges extraordinaires, exceptionnelles ou hors période
        $this->assertAccountBalance(10102, 0, 'sanity check: excluded while the fixture transaction is still dated in the future');

        // Move the future transaction into the past. Changing only the date does not change balance
        $connection->update('transaction_line', ['transaction_date' => Chronos::yesterday()], ['id' => 14013]);
        $this->assertAccountBalance(10102, 0, 'balance stays stale after the date alone changes, with no explicit recompute');

        // A brand new, unrelated transaction touches the same account
        $connection->insert('transaction', [
            'transaction_date' => Chronos::now(),
            'name' => 'Nouvel amortissement',
            'remarks' => '',
        ]);
        $transactionId = $connection->lastInsertId();

        $connection->insert('transaction_line', [
            'transaction_id' => $transactionId,
            'debit_id' => 10102,
            'credit_id' => 10086,
            'balance' => 2000,
            'transaction_date' => Chronos::now(),
        ]);

        // Trigger recompute new total on the ex future task
        $this->assertAccountBalance(10102, 5000 + 2000, 'balance must include both the newly inserted line and the stale one that just turned past');
        $this->assertAccountTotalBalance(10007, 0 + 5000 + 2000, 'group total must reflect both lines too'); // 8: Résultats extraordinaires et hors exploitation
    }

    public function testGroupTotalBalanceIsNullWhenMixingIncompatibleAccountTypes(): void
    {
        $this->setCurrentUser('administrator');

        $this->assertAccountTotalBalance(10011, 5000, 'group of liabilities only should have a total');
        $this->assertAccountTotalBalance(10001, 3506000, 'group of groups of liabilities only should have a total');
        $this->assertAccountTotalBalance(10007, 0, 'group mixing only revenue and expense should still have a total');

        // Move an asset account inside a group of liabilities, totals are recomputed on flush via Account::updateBalance()
        $assetAccount = $this->repository->getOneById(10026); // 1020. Banque > Raiffeisen (courant)
        $assetAccount->setParent($this->repository->getOneById(10011)); // 2030. Acomptes de clients
        $this->getEntityManager()->flush();

        $this->assertAccountTotalBalance(10011, null, 'group mixing asset and liability cannot have a total');
        $this->assertAccountTotalBalance(10001, null, 'ancestor group is affected by a mix deeper in its hierarchy');
        $this->assertAccountTotalBalance(10009, 818750, 'group that lost its asset child should still have a total');
        $this->assertAccountTotalBalance(10000, 1818750, 'ancestor of group that lost its asset child should still have a total');
        $this->assertAccountTotalBalance(10007, 0, 'group mixing only revenue and expense should still have a total');

        // The missing total must survive Doctrine hydration up to the PHP model. Clear the
        // entity manager first, because totals were recomputed in DB behind Doctrine's back.
        $this->getEntityManager()->clear();
        self::assertNull($this->repository->getOneById(10011)->getTotalBalance(), 'model should expose null for group mixing asset and liability');
        self::assertNull($this->repository->getOneById(10001)->getTotalBalance(), 'model should expose null for ancestor group');

        // Move the asset account back to its original place. The current user must be set
        // again because it was detached from the entity manager when we cleared it.
        $this->setCurrentUser('administrator');
        $assetAccount = $this->repository->getOneById(10026);
        $assetAccount->setParent($this->repository->getOneById(10024)); // 1020. Banque
        $this->getEntityManager()->flush();

        $this->assertAccountTotalBalance(10011, 5000, 'total should be restored when the mix is gone');
        $this->assertAccountTotalBalance(10001, 3506000, 'total should be restored when the mix is gone');
        $this->assertAccountTotalBalance(10000, 3518750, 'total should be restored when the mix is gone');

        $this->getEntityManager()->clear();
        $restoredTotalBalance = $this->repository->getOneById(10011)->getTotalBalance();
        self::assertNotNull($restoredTotalBalance, 'model should expose the total again when the mix is gone');
        self::assertTrue(Money::CHF(5000)->equals($restoredTotalBalance), 'model should expose the restored total');
    }

    public function testGroupTotalBalanceStillComputedWhenMixingRevenueAndExpense(): void
    {
        $this->setCurrentUser('administrator');

        $this->assertAccountTotalBalance(10002, 24000, 'group of revenues only should have a total');
        $this->assertAccountTotalBalance(10005, 11250, 'group of expenses only should have a total');

        // Move an expense account inside a group of revenues, totals are recomputed on flush via Account::updateBalance()
        $expenseAccount = $this->repository->getOneById(10022); // 6600. Publicité
        $expenseAccount->setParent($this->repository->getOneById(10002)); // 3. Produits
        $this->getEntityManager()->flush();

        $this->assertAccountTotalBalance(10002, 34000, 'group mixing only revenue and expense should still have a total');
        $this->assertAccountTotalBalance(10005, 1250, 'group that lost its expense child should still have a total');

        // Move the expense account back to its original place
        $expenseAccount->setParent($this->repository->getOneById(10005)); // 6. Autres charges exploitation, amortissement, ajustement de valeur
        $this->getEntityManager()->flush();

        $this->assertAccountTotalBalance(10002, 24000, 'total should be restored when the mix is gone');
        $this->assertAccountTotalBalance(10005, 11250, 'total should be restored when the mix is gone');
    }

    public function testChangingAccountTypeAutomaticallyRecomputesBalance(): void
    {
        $this->setCurrentUser('administrator');

        $account = $this->repository->getOneById(10026); // 10202. Raiffeisen (courant)
        self::assertSame(AccountType::Asset, $account->getType());
        $this->assertAccountBalance(10026, 1700000, 'sanity check: asset balance is debit - credit');

        $account->setType(AccountType::Liability);
        $this->getEntityManager()->flush();

        $this->assertAccountBalance(10026, -1700000, 'balance must be recomputed for the new type as soon as the account is flushed, with no explicit recompute call');
    }

    public function testGetOneById(): void
    {
        $account = $this->repository->getOneById(10025); // Poste
        self::assertSame(10025, $account->getId());
        $this->expectExceptionMessage('Account #-9999 not found');
        $this->repository->getOneById(-9999);
    }

    public function testDeleteUselessAccounts(): void
    {
        $connection = $this->getEntityManager()->getConnection();

        // Unrelated to this test, and would otherwise also be deleted by deleteUselessAccounts()
        $connection->delete('account', ['id' => 10109]);

        self::assertSame(0, $this->repository->deleteUselessAccounts(), 'nothing should be deleted from fixture data');

        $connection->insert('account', [
            'code' => '999001',
        ]);
        self::assertSame(0, $this->repository->deleteUselessAccounts(), 'orphan account without any owner should not be deleted');

        $connection->insert('account', [
            'code' => '999003',
            'owner_id' => '1008',
        ]);
        $countBefore = (int) $connection->fetchOne('SELECT COUNT(*) FROM account');
        self::assertSame(1, $this->repository->deleteUselessAccounts(), 'account of son (not family owner) without any transactionLine should be deleted');
        self::assertSame($countBefore - 1, (int) $connection->fetchOne('SELECT COUNT(*) FROM account'), 'exactly one account should have been deleted, no more');
        self::assertSame(0, $this->repository->deleteUselessAccounts(), 'nothing left to delete');

        $connection->insert('account', [
            'code' => '999003',
            'owner_id' => '1008',
        ]);
        $accountId = $connection->lastInsertId();

        $connection->insert('transaction_line', [
            'transaction_id' => 8000,
            'credit_id' => $accountId,
            'balance' => '0',
            'transaction_date' => Chronos::now(),
        ]);
        $transactionLineId = $connection->lastInsertId();
        self::assertSame(0, $this->repository->deleteUselessAccounts(), 'same as before, but with transaction to credit, should not delete');

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
            'balance' => '0',
            'transaction_date' => Chronos::now(),
        ]);
        self::assertSame(0, $this->repository->deleteUselessAccounts(), 'same as before, but with transaction to debit, should not delete');
    }

    #[DataProvider('providerGetNextCode')]
    public function testGetNextCode(?int $parentId, int $expected): void
    {
        $parent = $parentId ? $this->getEntityManager()->getReference(Account::class, $parentId) : null;
        $actual = $this->repository->getNextCodeAvailable($parent);
        self::assertSame($expected, $actual);
    }

    public static function providerGetNextCode(): iterable
    {
        yield [null, 10];
        yield [10011, 20300010];
        yield [10007, 8511];
    }

    public function testNewAccountHasNoTransaction(): void
    {
        self::assertFalse($this->repository->hasTransaction(new Account()));
    }

    #[DataProvider('providerHasTransaction')]
    public function testHasTransaction(int $id, bool $expected): void
    {
        $account = $this->getEntityManager()->getReference(Account::class, $id);
        self::assertNotNull($account);

        self::assertSame($expected, $this->repository->hasTransaction($account));
    }

    public static function providerHasTransaction(): iterable
    {
        yield [10000, true];
        yield [10096, true];
        yield [10008, false];
    }
}
