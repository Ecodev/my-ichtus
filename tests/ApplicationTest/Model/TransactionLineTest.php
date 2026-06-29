<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use PHPUnit\Framework\TestCase;

class TransactionLineTest extends TestCase
{
    public function testTransactionRelation(): void
    {
        $transaction1 = new Transaction();
        self::assertCount(0, $transaction1->getTransactionLines());

        $transactionLine1 = new TransactionLine();
        $transactionLine2 = new TransactionLine();
        $transactionLine1->setTransaction($transaction1);
        $transactionLine2->setTransaction($transaction1);

        self::assertCount(2, $transaction1->getTransactionLines());

        $transaction2 = new Transaction();
        $transactionLine2->setTransaction($transaction2);

        self::assertCount(1, $transaction1->getTransactionLines());
        self::assertCount(1, $transaction2->getTransactionLines());
    }

    public function testDebitAccountRelation(): void
    {
        $account1 = new Account();
        self::assertCount(0, $account1->getDebitTransactionLines());

        $transactionLine1 = new TransactionLine();
        $transactionLine2 = new TransactionLine();
        $transactionLine1->setDebit($account1);
        $transactionLine2->setDebit($account1);

        self::assertCount(2, $account1->getDebitTransactionLines());

        $account2 = new Account();
        $transactionLine2->setDebit($account2);

        self::assertCount(1, $account1->getDebitTransactionLines());
        self::assertCount(1, $account2->getDebitTransactionLines());

        $transactionLine1->setDebit(null);

        self::assertCount(0, $account1->getDebitTransactionLines());
        self::assertCount(1, $account2->getDebitTransactionLines());
    }

    public function testCreationStampDelegatesToTransaction(): void
    {
        $line = new TransactionLine();
        self::assertNull($line->getCreationDate());
        self::assertNull($line->getCreator());

        $transaction = new Transaction();
        $line->setTransaction($transaction);
        self::assertSame($transaction->getCreationDate(), $line->getCreationDate());
        self::assertSame($transaction->getCreator(), $line->getCreator());
    }

    public function testCreditAccountRelation(): void
    {
        $account1 = new Account();
        self::assertCount(0, $account1->getCreditTransactionLines());

        $transactionLine1 = new TransactionLine();
        $transactionLine2 = new TransactionLine();
        $transactionLine1->setCredit($account1);
        $transactionLine2->setCredit($account1);

        self::assertCount(2, $account1->getCreditTransactionLines());

        $account2 = new Account();
        $transactionLine2->setCredit($account2);

        self::assertCount(1, $account1->getCreditTransactionLines());
        self::assertCount(1, $account2->getCreditTransactionLines());

        $transactionLine1->setCredit(null);

        self::assertCount(0, $account1->getCreditTransactionLines());
        self::assertCount(1, $account2->getCreditTransactionLines());
    }
}
