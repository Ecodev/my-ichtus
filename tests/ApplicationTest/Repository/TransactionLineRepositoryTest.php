<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\Account;
use Application\Model\TransactionLine;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionLineRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Cake\Chronos\Chronos;
use Cake\Chronos\ChronosDate;
use Money\Money;

class TransactionLineRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    private TransactionLineRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(TransactionLine::class);
    }

    public function providerGetAccessibleSubQuery(): iterable
    {
        $all = range(14000, 14011);

        $family = [14000, 14002, 14003, 14004, 14008, 14011];
        yield ['anonymous', []];
        yield ['bookingonly', []];
        yield ['individual', $family];
        yield ['member', $family];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }

    public function testTriggers(): void
    {
        $account1 = 10096;
        $account2 = 10037;
        $account3 = 10085;
        $account4 = 10025;

        $this->assertAccountBalance($account1, 5000, 'initial balance');
        $this->assertAccountBalance($account2, 10000, 'initial balance');
        $this->assertAccountBalance($account3, 1250, 'initial balance');
        $this->assertAccountBalance($account4, 818750, 'initial balance');

        $connection = $this->getEntityManager()->getConnection();
        $connection->insert('transaction_line', [
            'transaction_id' => 8000,
            'debit_id' => $account1,
            'credit_id' => $account2,
            'balance' => 500,
        ]);

        $id = $connection->lastInsertId();

        $this->assertAccountBalance($account1, 4500, 'balance should be reduced when line is inserted');
        $this->assertAccountBalance($account2, 10500, 'balance should be increased when line is inserted');

        $count = $connection->update(
            'transaction_line',
            [
                'balance' => 4000,
            ],
            [
                'id' => $id,
            ]
        );
        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, 1000, 'balance should be reduced even more after update');
        $this->assertAccountBalance($account2, 14000, 'balance should be increased even more after update');

        $count = $connection->update(
            'transaction_line',
            [
                'debit_id' => $account3,
                'credit_id' => $account4,
            ],
            [
                'id' => $id,
            ]
        );
        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, 5000, 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account2, 10000, 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account3, 5250, 'balance should be increased after swapped account');
        $this->assertAccountBalance($account4, 814750, 'balance should be reduced after swapped account');

        $count = $connection->delete('transaction_line', ['id' => $id]);
        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, 5000, 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account2, 10000, 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account3, 1250, 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account4, 818750, 'balance should be restored to its original value after deletion');
    }

    public function testTotalBalance(): void
    {
        /** @var AccountRepository $accountRepository */
        $accountRepository = _em()->getRepository(Account::class);

        /** @var Account $poste */
        $poste = $accountRepository->getOneById(10025);

        $totalDebit = $this->repository->totalBalance($poste, null);
        $totalCredit = $this->repository->totalBalance(null, $poste);
        self::assertTrue(Money::CHF(1520000)->equals($totalDebit));
        self::assertTrue(Money::CHF(701250)->equals($totalCredit));

        $totalDebitFromDate = $this->repository->totalBalance($poste, null, new ChronosDate('2019-02-01'));
        $totalDebitUntilDate = $this->repository->totalBalance($poste, null, null, new ChronosDate('2019-01-01'));
        self::assertTrue(Money::CHF(20000)->equals($totalDebitFromDate));
        self::assertTrue(Money::CHF(1500000)->equals($totalDebitUntilDate));
    }

    /**
     * @dataProvider providerImportedExists
     */
    public function testImportedExists(string $importedId, string $transactionDate, bool $expected): void
    {
        self::assertSame($expected, $this->repository->importedExists($importedId, new Chronos($transactionDate)));
    }

    public function providerImportedExists(): iterable
    {
        yield 'duplicated' => ['my-unique-imported-id', '2019-04-05', true];
        yield 'different date' => ['my-unique-imported-id', '2019-02-05', false];
        yield 'different id' => ['something-else', '2019-04-05', false];
    }
}
