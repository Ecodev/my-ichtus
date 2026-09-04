<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\TransactionRepository;
use ApplicationTest\Assert;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Cake\Chronos\Chronos;
use Ecodev\Felix\Api\Exception;
use GraphQL\Doctrine\Definition\EntityID;
use Money\Money;

class TransactionRepositoryTest extends AbstractRepository
{
    use LimitedAccessSubQuery;

    private TransactionRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Transaction::class);
    }

    public static function providerGetAccessibleSubQuery(): iterable
    {
        $all = [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009];

        $family = [8000, 8002, 8002, 8003, 8004, 8006, 8008];
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
        self::assertNotNull($credit);
        $debit = $this->getEntityManager()->getRepository(Account::class)->findOneBy(['code' => 10101]);
        self::assertNotNull($debit);

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

        Assert::assertMoney(Money::CHF(500), $credit->getLeafBalance(), 'credit account balance must have been refreshed from DB');
        Assert::assertMoney(Money::CHF(819250), $debit->getLeafBalance(), 'debit account balance must have been refreshed from DB');
        self::assertFalse($transaction->getTransactionLines()->contains($line), 'original line must have been deleted');
        self::assertCount(1, $transaction->getTransactionLines(), 'one line');

        $line = $transaction->getTransactionLines()->first();
        Assert::assertMoney(Money::CHF(500), $line->getBalance());
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

    public function testHydrateLinesAndFlushKeepsImportedIdOfUpdatedLine(): void
    {
        $this->setCurrentUser('administrator');

        $transaction = $this->getTransaction(8005);
        $clientLines = $this->getClientLines($transaction);

        // Change the line that came from a bank statement import
        $clientLines[14006] = array_replace($clientLines[14006], ['remarks' => 'Paiement confirmé']);

        $this->repository->hydrateLinesAndFlush($transaction, $clientLines);

        // Read the database, because the line object would still carry its imported id even if the
        // line had been deleted and recreated behind its back
        $connection = $this->getEntityManager()->getConnection();
        $importedId = $connection->fetchOne('SELECT imported_id FROM transaction_line WHERE id = 14006');
        $remarks = $connection->fetchOne('SELECT remarks FROM transaction_line WHERE id = 14006');

        self::assertSame('imported-voilier-postfinance', $importedId, 'the imported id must survive the update');
        self::assertSame('Paiement confirmé', $remarks);
    }

    public function testHydrateLinesAndFlushRefusesALineOfAnotherTransaction(): void
    {
        $this->setCurrentUser('administrator');

        $transaction = $this->getTransaction(8005);
        $clientLines = $this->getClientLines($transaction);

        // Line 14000 belongs to transaction 8000, so it cannot be stolen by transaction 8005
        $stolenLine = $this->getClientLines($this->getTransaction(8000))[14000];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('A TransactionLine can only be updated by the Transaction it belongs to');
        $this->repository->hydrateLinesAndFlush($transaction, [...$clientLines, $stolenLine]);
    }

    private function getTransaction(int $id): Transaction
    {
        /** @var Transaction $transaction */
        $transaction = _em()->find(Transaction::class, $id);

        return $transaction;
    }

    private function getLine(int $id): TransactionLine
    {
        /** @var TransactionLine $line */
        $line = _em()->find(TransactionLine::class, $id);

        return $line;
    }

    /**
     * All the lines of the transaction, exactly as they are recorded, each with its id and keyed by
     * it. This is what the form sends back when nothing was touched.
     */
    private function getClientLines(Transaction $transaction): array
    {
        $lines = [];
        foreach ($transaction->getTransactionLines() as $line) {
            $lines[(int) $line->getId()] = [
                'id' => new EntityID(_em(), TransactionLine::class, (string) $line->getId()),
                'name' => $line->getName(),
                'remarks' => $line->getRemarks(),
                'balance' => $line->getBalance(),
                'credit' => $line->getCredit(),
                'debit' => $line->getDebit(),
                'bookable' => $line->getBookable(),
                'isReconciled' => $line->isReconciled(),
                'transactionDate' => $line->getTransactionDate(),
                'transactionTag' => $line->getTransactionTag(),
            ];
        }

        return $lines;
    }

    public function testTriggers(): void
    {
        $account1 = 10096;
        $account2 = 10037;

        $this->assertAccountBalance($account1, 10000, 'initial balance');
        $this->assertAccountBalance($account2, 10000, 'initial balance');

        $connection = $this->getEntityManager()->getConnection();
        $count = $connection->delete('transaction', ['id' => 8000]);

        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, 20000, 'balance should be increased after deletion');
        $this->assertAccountBalance($account2, 0, 'balance should be decreased after deletion');
    }

    public function testFlushWithFastTransactionLineTriggersWithTransaction(): void
    {
        $account1 = 10096;
        $account2 = 10037;

        $this->assertAccountBalance($account1, 10000, 'initial balance');
        $this->assertAccountBalance($account2, 10000, 'initial balance');

        // DELETE
        $this->setCurrentUser('administrator');
        $transaction = _em()->getReference(Transaction::class, 8000);
        self::assertNotNull($transaction);
        $this->getEntityManager()->remove($transaction);
        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 20000, 'balance should be increased after deletion');
        $this->assertAccountBalance($account2, 0, 'balance should be decreased after deletion');
    }

    public function testFlushWithFastTransactionLineTriggersWithTransactionLine(): void
    {
        $account1 = 10096;
        $account2 = 10037;

        $this->assertAccountBalance($account1, 10000, 'initial balance');
        $this->assertAccountBalance($account2, 10000, 'initial balance');

        // UPDATE
        $this->setCurrentUser('administrator');
        /** @var TransactionLine $transactionLine */
        $transactionLine = _em()->getReference(TransactionLine::class, 14000);
        $transactionLine->setBalance(Money::CHF(1));
        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 19999, 'balance should be increased after update');
        $this->assertAccountBalance($account2, 1, 'balance should be decreased after update');

        // DELETE
        $this->getEntityManager()->remove($transactionLine);
        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 20000, 'balance should be increased after deletion');
        $this->assertAccountBalance($account2, 0, 'balance should be decreased after deletion');

        // INSERT
        $transactionLine = new TransactionLine();
        $this->getEntityManager()->persist($transactionLine);
        $transactionLine->setBalance(Money::CHF(5));
        $transactionLine->setTransactionDate(Chronos::now());
        $ref = $this->getEntityManager()->getReference(Transaction::class, 8000);
        self::assertNotNull($ref);
        $transactionLine->setTransaction($ref);
        $transactionLine->setDebit($this->getEntityManager()->getReference(Account::class, $account1));
        $transactionLine->setCredit($this->getEntityManager()->getReference(Account::class, $account2));

        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 19995, 'balance should be increased after insertion');
        $this->assertAccountBalance($account2, 5, 'balance should be decreased after insertion');

        // Normal flush should keep working after use of special flush
        $transactionLine->setBalance(Money::CHF(10));
        _em()->flush();

        $this->assertAccountBalance($account1, 19990, 'balance should be increased after update with normal flush and normal triggers');
        $this->assertAccountBalance($account2, 10, 'balance should be decreased after update with normal flush and normal triggers');

        // UPDATE, moving the line to another account
        $account3 = 10027;
        $this->assertAccountBalance($account3, 0, 'initial balance');

        $transactionLine->setDebit($this->getEntityManager()->getReference(Account::class, $account3));
        $this->repository->flushWithFastTransactionLineTriggers();

        $this->assertAccountBalance($account1, 20000, 'the account that was left must be recomputed too');
        $this->assertAccountBalance($account3, 10, 'the account that was joined must be recomputed');
        $this->assertAccountBalance($account2, 10, 'the credit side must not have moved');
    }

    public function testGetLastClosingDate(): void
    {
        self::assertSame('2019-02-04', $this->repository->getLastClosingDate()?->toDateString());
    }

    public function testIsClosedWhenOneOfTheLinesIsBeforeTheLastClosing(): void
    {
        $this->setCurrentUser('administrator');

        // Transaction 8000 is dated after the closing of 2019-02-04, so it is open on its own
        $transactionAfterClosing = $this->getTransaction(8000);
        self::assertFalse($this->repository->isClosed($transactionAfterClosing));

        // But the accounting period is delimited by the dates of the lines, and this one reaches
        // back into the closed period
        $this->getLine(14000)->setTransactionDate(new Chronos('2019-01-15'));
        self::assertTrue($this->repository->isClosed($transactionAfterClosing));
    }

    public function testIsClosed(): void
    {
        $this->setCurrentUser('administrator');

        $beforeClosing = $this->getTransaction(8007);
        $closing = $this->getTransaction(8005);
        $afterClosing = $this->getTransaction(8000);

        self::assertTrue($this->repository->isClosed($beforeClosing));
        self::assertFalse($this->repository->isClosed($closing), 'the closing transaction itself can still be deleted');
        self::assertFalse($this->repository->isClosed($afterClosing));

        $beforeClosing->setTransactionDate(new Chronos('2019-06-01'));
        self::assertTrue($this->repository->isClosed($beforeClosing), 'moving an old transaction after the closing must not unlock it');

        $afterClosing->setTransactionDate(new Chronos('2019-01-02'));
        self::assertTrue($this->repository->isClosed($afterClosing), 'moving a recent transaction before the closing must be refused');
    }
}
