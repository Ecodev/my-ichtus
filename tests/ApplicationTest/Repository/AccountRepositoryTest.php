<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Enum\AccountType;
use Application\Enum\BalanceGrouping;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use ApplicationTest\Assert;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Cake\Chronos\Chronos;
use Cake\Chronos\ChronosDate;
use Doctrine\DBAL\Exception\DriverException;
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

        Assert::assertMoney(Money::CHF(3518750), $totalAssets);
        Assert::assertMoney(Money::CHF(3506000), $totalLiabilities);
        Assert::assertMoney(Money::CHF(24000), $totalRevenue);
        Assert::assertMoney(Money::CHF(11250), $totalExpense);
        Assert::assertMoney(Money::CHF(0), $totalEquity);

        $groupAccount = $this->repository->getOneById(10001); // 2. Passifs
        self::assertSame(AccountType::Group, $groupAccount->getType(), 'is a group');
        $groupBalance = $groupAccount->getBalance();
        self::assertNotNull($groupBalance);
        Assert::assertMoney(Money::CHF(3506000), $groupBalance, 'balance for group account should have been computed via DB triggers');

        $otherAccount = $this->repository->getOneById(10025); // 10201. PostFinance
        self::assertNotSame(AccountType::Group, $otherAccount->getType(), 'not a group');
        Assert::assertMoney(Money::CHF(818750), $otherAccount->getLeafBalance(), 'balance for non-group should have been computed via DB triggers');
    }

    // ex-future = transaction that past from future to past.
    public function testCronUpdatesExFutureTransactionBalance(): void
    {
        $connection = $this->getEntityManager()->getConnection();

        $transactionDate = new Chronos($connection->fetchOne('SELECT transaction_date FROM transaction_line WHERE id = 14013'));
        self::assertTrue($transactionDate->greaterThan(Chronos::now()), 'fixture transaction must stay dated in the future for this test to be meaningful');

        // 8500: Charges extraordinaires, exceptionnelles ou hors période (would be 5000 if the future transaction were wrongly included)
        $this->assertAccountBalance(10102, 0, 'balance must exclude the transaction dated in the future');
        $this->assertAccountBalance(10007, 0, 'group total must exclude the transaction dated in the future'); // 8: Résultats extraordinaires et hors exploitation

        // Easiest way to grant update_account_balance excludes the future is to recompute them all (acceptable on fixtures).
        $this->repository->updateAccountsBalance();
        $this->assertAccountBalance(10102, 0, 'explicit recompute must also exclude the transaction dated in the future');

        // Move the future transaction into the past. Changing only the date does not change balance
        $connection->update('transaction_line', ['transaction_date' => Chronos::yesterday()], ['id' => 14013]);
        $this->assertAccountBalance(10102, 0, 'balance stays stale after the date alone changes, with no explicit recompute');

        $this->repository->updateAccountsBalance();
        $this->assertAccountBalance(10102, 5000, 'once dated in the past, the transaction must be added to the balance on next recompute');
        $this->assertAccountBalance(10007, 5000, 'group total must include it too');
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
        $this->assertAccountBalance(10007, 0 + 5000 + 2000, 'group total must reflect both lines too'); // 8: Résultats extraordinaires et hors exploitation
    }

    public function testGroupTotalBalanceIsNullWhenMixingIncompatibleAccountTypes(): void
    {
        $this->setCurrentUser('administrator');

        $this->assertAccountBalance(10011, 5000, 'group of liabilities only should have a total');
        $this->assertAccountBalance(10001, 3506000, 'group of groups of liabilities only should have a total');
        $this->assertAccountBalance(10007, 0, 'group mixing only revenue and expense should still have a total');

        // Move an asset account inside a group of liabilities, totals are recomputed on flush via Account::updateBalance()
        $assetAccount = $this->repository->getOneById(10026); // 1020. Banque > Raiffeisen (courant)
        $assetAccount->setParent($this->repository->getOneById(10011)); // 2030. Acomptes de clients
        $this->getEntityManager()->flush();

        $this->assertAccountBalance(10011, null, 'group mixing asset and liability cannot have a total');
        $this->assertAccountBalance(10001, null, 'ancestor group is affected by a mix deeper in its hierarchy');
        $this->assertAccountBalance(10009, 818750, 'group that lost its asset child should still have a total');
        $this->assertAccountBalance(10000, 1818750, 'ancestor of group that lost its asset child should still have a total');
        $this->assertAccountBalance(10007, 0, 'group mixing only revenue and expense should still have a total');

        // The missing total must survive Doctrine hydration up to the PHP model. Clear the
        // entity manager first, because totals were recomputed in DB behind Doctrine's back.
        $this->getEntityManager()->clear();
        self::assertNull($this->repository->getOneById(10011)->getBalance(), 'model should expose null for group mixing asset and liability');
        self::assertNull($this->repository->getOneById(10001)->getBalance(), 'model should expose null for ancestor group');

        // Move the asset account back to its original place. The current user must be set
        // again because it was detached from the entity manager when we cleared it.
        $this->setCurrentUser('administrator');
        $assetAccount = $this->repository->getOneById(10026);
        $assetAccount->setParent($this->repository->getOneById(10024)); // 1020. Banque
        $this->getEntityManager()->flush();

        $this->assertAccountBalance(10011, 5000, 'total should be restored when the mix is gone');
        $this->assertAccountBalance(10001, 3506000, 'total should be restored when the mix is gone');
        $this->assertAccountBalance(10000, 3518750, 'total should be restored when the mix is gone');

        $this->getEntityManager()->clear();
        $restoredTotalBalance = $this->repository->getOneById(10011)->getBalance();
        self::assertNotNull($restoredTotalBalance, 'model should expose the total again when the mix is gone');
        Assert::assertMoney(Money::CHF(5000), $restoredTotalBalance, 'model should expose the restored total');
    }

    public function testGroupTotalBalanceStillComputedWhenMixingRevenueAndExpense(): void
    {
        $this->setCurrentUser('administrator');

        $this->assertAccountBalance(10002, 24000, 'group of revenues only should have a total');
        $this->assertAccountBalance(10005, 11250, 'group of expenses only should have a total');

        // Move an expense account inside a group of revenues, totals are recomputed on flush via Account::updateBalance()
        $expenseAccount = $this->repository->getOneById(10022); // 6600. Publicité
        $expenseAccount->setParent($this->repository->getOneById(10002)); // 3. Produits
        $this->getEntityManager()->flush();

        $this->assertAccountBalance(10002, 34000, 'group mixing only revenue and expense should still have a total');
        $this->assertAccountBalance(10005, 1250, 'group that lost its expense child should still have a total');

        // Move the expense account back to its original place
        $expenseAccount->setParent($this->repository->getOneById(10005)); // 6. Autres charges exploitation, amortissement, ajustement de valeur
        $this->getEntityManager()->flush();

        $this->assertAccountBalance(10002, 24000, 'total should be restored when the mix is gone');
        $this->assertAccountBalance(10005, 11250, 'total should be restored when the mix is gone');
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

    /**
     * Three ways to know a balance must agree: `account.balance` cached by
     * `update_account_balance` in triggers.sql, `AccountRepository::getAccountsForReport()` and
     * `AccountRepository::getAccountsVariations()`, the last two summing transaction lines with
     * their own query when asked for a past date. This is our only check that cached balances,
     * leaves and groups alike, match the accounting entries they are derived from.
     */
    public function testBalanceMatchesAccountingEntries(): void
    {
        $connection = $this->getEntityManager()->getConnection();

        // Recompute everything, so that the cache covers every entry that is not in the future
        $this->repository->updateAccountsBalance();

        // A date in the past, so that the report recomputes instead of reading the cache. Fixtures
        // have no entry more recent than yesterday, so both cover exactly the same entries.
        $date = ChronosDate::yesterday();

        // The report hides deep and zero balance accounts for readability, which is none of our
        // business here, so configure it to be exhaustive
        $accountingConfig = [
            'customerDepositsAccountCode' => 2030,
            'report' => [
                'showAccountsWithZeroBalance' => true,
                'maxAccountDepth' => 100,
            ],
        ];

        // Members accounts are deliberately not detailed by the report, only their parent is
        $reportable = $connection->fetchAllKeyValue(
            'SELECT account.id, account.balance FROM account
                LEFT JOIN account parent ON parent.id = account.parent_id
                WHERE parent.code != :customerDepositsAccountCode OR account.parent_id IS NULL',
            ['customerDepositsAccountCode' => $accountingConfig['customerDepositsAccountCode']],
        );

        // The report splits a group into one row per account type, so rows must be summed back together
        $reported = [];
        foreach ($this->repository->getAccountsForReport($accountingConfig, $date) as $account) {
            $id = (int) $account['id'];
            $reported[$id] = ($reported[$id] ?? 0) + (int) $account['balance'];
        }

        foreach ($reportable as $id => $balance) {
            // An account with no entry at all is not reported, but its balance is indeed zero
            self::assertSame((int) $balance, $reported[(int) $id] ?? 0, 'cached balance of account #' . $id . ' must match its accounting entries');
        }

        // `getAccountsVariations()` sums the same entries with yet another query, and has no
        // reason to skip members accounts
        $balances = $connection->fetchAllKeyValue('SELECT id, balance FROM account');

        $variations = $this->repository->getAccountsVariations(null, $date);
        foreach ($balances as $id => $balance) {
            // A group with no account under it totals nothing, so it is not returned at all
            self::assertSame((int) $balance, $variations[(int) $id] ?? 0, 'balance at date of account #' . $id . ' must match its cached balance');
        }
    }

    public function testGetAccountsVariationsWithoutStartDateGivesBalanceAtDate(): void
    {
        // Past balance of an asset account
        // 10201: PostFinance
        $postFinance = 10025;
        self::assertSame(800000, $this->repository->getAccountsVariations(null, new ChronosDate('2019-03-01'))[$postFinance]);
        self::assertSame(818750, $this->repository->getAccountsVariations(null, new ChronosDate('2019-05-01'))[$postFinance]);

        // Past balance of a group account
        // 6: Autres charges exploitation
        $otherExpenses = 10005;
        self::assertSame(0, $this->repository->getAccountsVariations(null, new ChronosDate('2019-03-01'))[$otherExpenses]);
        self::assertSame(1250, $this->repository->getAccountsVariations(null, new ChronosDate('2019-03-12'))[$otherExpenses]);
    }

    public function testGetAccountsVariationsHonoursADateInTheFuture(): void
    {
        // The fixture dates the only entry of this account ten years from now
        $exceptionalDepreciation = 10102;

        $now = $this->repository->getAccountsVariations(null, null);
        self::assertSame(0, $now[$exceptionalDepreciation], 'without an end date the period stops now, leaving out the entry dated in the future');

        $afterTheFutureEntry = ChronosDate::today()->addYears(11);
        $later = $this->repository->getAccountsVariations(null, $afterTheFutureEntry);
        self::assertSame(5000, $later[$exceptionalDepreciation], 'an end date in the future includes every entry dated up to it');
    }

    public function testGetAccountsVariationsRefusesAPeriodStartingAfterItEnds(): void
    {
        $this->expectExceptionMessage('Period cannot start after it ends');

        // Without an end date the period runs up to now, so it cannot start tomorrow
        $this->repository->getAccountsVariations(ChronosDate::tomorrow(), null);
    }

    public function testGetAccountsVariationsRefusesAnInvertedPeriod(): void
    {
        $this->expectExceptionMessage('Period cannot start after it ends');

        $this->repository->getAccountsVariations(new ChronosDate('2019-03-20'), new ChronosDate('2019-01-03'));
    }

    public function testGetAccountsBalancesRefusesAPreviousDateThatIsNotStrictlyOlder(): void
    {
        $this->expectExceptionMessage('Previous date must be strictly older than date');

        $date = ChronosDate::yesterday();
        $this->repository->getAccountsBalances($date, $date);
    }

    public function testGetAccountsBalancesTotalsTheDescendantsOfTheRequestedGroup(): void
    {
        // 6500. Charges d'administration: 65001 Photocopies has 1'250, its eight other children have nothing
        $administration = $this->repository->getAccountsBalances(ChronosDate::yesterday(), null, [10021]);

        self::assertCount(1, $administration, 'children of the group are totalled, but not returned themselves');
        self::assertSame('expense', $administration[0]['type']);
        self::assertSame(1250, $administration[0]['balance']);
    }

    public function testGetAccountsBalancesReturnsChildrenWithoutTheirGroup(): void
    {
        $administration = $this->repository->getAccountsBalances(ChronosDate::yesterday(), null, [10085, 10086]);
        $byAccount = array_column($administration, null, 'id');

        self::assertCount(2, $administration, 'their group 6500. Charges d\'administration was not asked for');
        self::assertSame(1250, $byAccount[10085]['balance'], '65001 Photocopies');
        self::assertSame(0, $byAccount[10086]['balance'], '65002 Envois timbres has no accounting entry at all, and is still returned');
    }

    public function testGetAccountsBalancesSplitsAGroupPerTypeOfItsDescendants(): void
    {
        // Move 6600 Publicité, an expense of 10'000, under 3. Produits, which has 24'000 of revenue
        $connection = $this->getEntityManager()->getConnection();
        $connection->update('account', ['parent_id' => 10002], ['id' => 10022]);

        $revenues = $this->repository->getAccountsBalances(ChronosDate::yesterday(), null, [10002]);
        $byType = array_column($revenues, null, 'type');

        self::assertCount(2, $revenues, 'the group is returned once per type of its descendants');
        self::assertSame(24000, $byType['revenue']['balance']);
        self::assertSame(10000, $byType['expense']['balance']);
    }

    public function testGetAccountsBalancesTotalsRevenueAndExpenseTogetherInASingleRow(): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $connection->update('account', ['parent_id' => 10002], ['id' => 10022]);

        $revenues = $this->repository->getAccountsBalances(ChronosDate::yesterday(), null, [10002], BalanceGrouping::PerAccount);

        self::assertCount(1, $revenues, '3. Produits is not split anymore');
        self::assertSame('revenue', $revenues[0]['type'], 'totalling revenue and expense gives a revenue, since a negative revenue is an expense');
        self::assertSame(34000, $revenues[0]['balance'], 'revenue and expense are the only types that can be totalled together');
    }

    public function testGetAccountsBalancesHasNoBalanceWhenAGroupMixesIncompatibleTypes(): void
    {
        // Move 1020. Banque > Raiffeisen (courant) under 2030. Acomptes de clients, a group of liabilities
        $connection = $this->getEntityManager()->getConnection();
        $connection->update('account', ['parent_id' => 10011], ['id' => 10026]);

        $deposits = $this->repository->getAccountsBalances(ChronosDate::yesterday(), null, [10011], BalanceGrouping::PerAccount);

        self::assertNull($deposits[0]['balance'], 'an asset totalled with liabilities means nothing');
        self::assertNull($deposits[0]['type']);
    }

    public function testGetAccountsBalancesIgnoresAccountsWithoutAnyBalanceToDetectAMix(): void
    {
        // Move 4400 Prestations / travaux de tiers, which has no accounting entry at all, under a group of liabilities
        $connection = $this->getEntityManager()->getConnection();
        $connection->update('account', ['parent_id' => 10105], ['id' => 10015]);

        $ownFunds = $this->repository->getAccountsBalances(ChronosDate::yesterday(), null, [10105], BalanceGrouping::PerAccount);

        self::assertSame(3500000, $ownFunds[0]['balance'], 'an expense at zero cannot distort the total of a group of liabilities');
        self::assertSame('liability', $ownFunds[0]['type'], 'and it is not the type of the group either');
    }

    public function testGetAccountsBalancesReadsTheCacheWithoutADateAndSumsEntriesForAGivenDate(): void
    {
        // 100. Liquidités totals 10101 PostFinance CNI and 10202 Raiffeisen (courant)
        $now = $this->repository->getAccountsBalances(null, null, [10009]);
        $yesterday = $this->repository->getAccountsBalances(ChronosDate::yesterday(), null, [10009]);

        self::assertSame(2518750, $now[0]['balance'], 'without a date the cached balance of each child is read');
        self::assertSame(2518750, $yesterday[0]['balance'], 'a date sums the accounting entries instead');
    }

    public function testGetAccountsBalancesTotalsAtThePreviousDateToo(): void
    {
        $liquidities = $this->repository->getAccountsBalances(ChronosDate::yesterday(), new ChronosDate('2019-03-01'), [10009]);

        self::assertSame(2518750, $liquidities[0]['balance']);
        self::assertSame(2500000, $liquidities[0]['previousBalance']);
    }

    public function testGroupTotalBalanceIgnoresAccountsWithoutAnyBalanceToDetectAMix(): void
    {
        $this->setCurrentUser('administrator');

        // 4400 Prestations / travaux de tiers has no accounting entry at all, so moving it into a
        // group of liabilities must not deprive that group of its total
        $emptyExpense = $this->repository->getOneById(10015);
        $emptyExpense->setParent($this->repository->getOneById(10105)); // 28. Fonds propres
        $this->getEntityManager()->flush();

        $this->assertAccountBalance(10105, 3500000, 'an expense at zero cannot distort a group of liabilities');
        $this->assertAccountBalance(10001, 3506000, 'and it does not affect its ancestors either');
    }

    public function testGroupAccountCanHaveNullBalance(): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $connection->update('account', ['balance' => null], ['id' => 10011]); // Acomptes de clients

        $this->assertAccountBalance(10011, null, 'a group account may have a null balance, because it may mix incompatible account types');
    }

    /**
     * `Account::getLeafBalance()` relies on that invariant, so it must stay enforced by
     * the `leaf_balance_not_null` constraint in DB, whatever future migrations do.
     */
    public function testNonGroupAccountCannotHaveNullBalance(): void
    {
        $this->expectException(DriverException::class);
        $this->expectExceptionMessageMatches('/leaf_balance_not_null/');

        $this->getEntityManager()->getConnection()->update('account', ['balance' => null], ['id' => 10025]); // Poste
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
