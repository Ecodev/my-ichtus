<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\TransactionRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Cake\Chronos\Chronos;
use Money\Money;

class TransactionRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    private TransactionRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Transaction::class);
    }

    public function providerGetAccessibleSubQuery(): iterable
    {
        $all = [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007];

        $family = [8000, 8002, 8002, 8003, 8004, 8006];
        yield ['anonymous', []];
        yield ['bookingonly', []];
        yield ['individual', $family];
        yield ['member', $family];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }

    public function testHydrateLinesAndFlush(): void
    {
        /** @var User $user */
        $user = $this->getEntityManager()->getRepository(User::class)->getOneByLoginOrEmail('administrator');
        User::setCurrent($user);

        $credit = $user->getAccount();
        $debit = $this->getEntityManager()->getRepository(Account::class)->findOneBy(['code' => 10101]);

        $transaction = new Transaction();
        $transaction->setName('foo');
        $transaction->setTransactionDate(Chronos::now());
        $line = new TransactionLine();
        $line->setTransaction($transaction);

        self::assertTrue($transaction->getTransactionLines()->contains($line));
        $lines = [
            [
                'balance' => Money::CHF(500),
                'transactionDate' => Chronos::now(),
                'credit' => $credit,
                'debit' => $debit,
            ],
        ];

        $this->repository->hydrateLinesAndFlush($transaction, $lines);

        self::assertTrue(Money::CHF(500)->equals($credit->getBalance()), 'credit account balance must have been refreshed from DB');
        self::assertTrue(Money::CHF(819250)->equals($debit->getBalance()), 'debit account balance must have been refreshed from DB');
        self::assertFalse($transaction->getTransactionLines()->contains($line), 'original line must have been deleted');
        self::assertCount(1, $transaction->getTransactionLines(), 'one line');

        $line = $transaction->getTransactionLines()->first();
        self::assertTrue(Money::CHF(500)->equals($line->getBalance()));
        self::assertSame($credit, $line->getCredit());
        self::assertSame($debit, $line->getDebit());
    }

    public function testHydrateLinesAndFlushMustThrowWithoutAnyLines(): void
    {
        $transaction = new Transaction();

        $this->expectExceptionMessage('A Transaction must have at least one TransactionLine');
        $this->repository->hydrateLinesAndFlush($transaction, []);
    }

    public function testHydrateLinesAndFlushMustThrowWithALineWithoutAnyAccount(): void
    {
        $transaction = new Transaction();
        $this->expectExceptionMessage('Cannot create a TransactionLine without any account');
        $this->repository->hydrateLinesAndFlush($transaction, [[]]);
    }

    public function testHydrateLinesAndFlushMustThrowWithUnbalancedLines(): void
    {
        /** @var User $user */
        $user = $this->getEntityManager()->getRepository(User::class)->getOneByLoginOrEmail('administrator');
        User::setCurrent($user);

        $debit = $this->getEntityManager()->getRepository(Account::class)->findOneBy(['code' => 10101]);
        $credit = $this->getEntityManager()->getRepository(Account::class)->findOneBy(['code' => 10202]);

        $transaction = new Transaction();
        $transaction->setName('banque à poste');
        $transaction->setRemarks('montants erronés');
        $transaction->setTransactionDate(Chronos::now());
        $line = new TransactionLine();
        $line->setTransaction($transaction);

        $lines = [
            [
                'balance' => Money::CHF(100000),
                'transactionDate' => Chronos::now(),
                'debit' => $debit,
            ],
            [
                'balance' => Money::CHF(90000),
                'credit' => $credit,
            ],
        ];

        $this->expectExceptionMessage('Transaction NEW non-équilibrée, débits: 1000.00, crédits: 900.00');
        $this->repository->hydrateLinesAndFlush($transaction, $lines);
    }

    public function testTriggers(): void
    {
        $account1 = 10096;
        $account2 = 10037;

        $this->assertAccountBalance($account1, 5000, 'initial balance');
        $this->assertAccountBalance($account2, 10000, 'initial balance');

        $connection = $this->getEntityManager()->getConnection();
        $count = $connection->delete('transaction', ['id' => 8000]);

        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, 15000, 'balance should be increased after deletion');
        $this->assertAccountBalance($account2, 0, 'balance should be decreased after deletion');
    }

    public function testFlushWithFastTransactionLineTriggersWithTransaction(): void
    {
        $account1 = 10096;
        $account2 = 10037;

        $this->assertAccountBalance($account1, 5000, 'initial balance');
        $this->assertAccountBalance($account2, 10000, 'initial balance');

        // DELETE
        $this->setCurrentUser('administrator');
        $transaction = _em()->getReference(Transaction::class, 8000);
        $this->getEntityManager()->remove($transaction);
        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 15000, 'balance should be increased after deletion');
        $this->assertAccountBalance($account2, 0, 'balance should be decreased after deletion');
    }

    public function testFlushWithFastTransactionLineTriggersWithTransactionLine(): void
    {
        $account1 = 10096;
        $account2 = 10037;

        $this->assertAccountBalance($account1, 5000, 'initial balance');
        $this->assertAccountBalance($account2, 10000, 'initial balance');

        // UPDATE
        $this->setCurrentUser('administrator');
        /** @var TransactionLine $transactionLine */
        $transactionLine = _em()->getReference(TransactionLine::class, 14000);
        $transactionLine->setBalance(Money::CHF(1));
        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 14999, 'balance should be increased after update');
        $this->assertAccountBalance($account2, 1, 'balance should be decreased after update');

        // DELETE
        $this->getEntityManager()->remove($transactionLine);
        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 15000, 'balance should be increased after deletion');
        $this->assertAccountBalance($account2, 0, 'balance should be decreased after deletion');

        // INSERT
        $transactionLine = new TransactionLine();
        $this->getEntityManager()->persist($transactionLine);
        $transactionLine->setBalance(Money::CHF(5));
        $transactionLine->setTransactionDate(Chronos::now());
        $transactionLine->setTransaction($this->getEntityManager()->getReference(Transaction::class, 8000));
        $transactionLine->setDebit($this->getEntityManager()->getReference(Account::class, $account1));
        $transactionLine->setCredit($this->getEntityManager()->getReference(Account::class, $account2));

        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 14995, 'balance should be increased after insertion');
        $this->assertAccountBalance($account2, 5, 'balance should be decreased after insertion');
    }
}
