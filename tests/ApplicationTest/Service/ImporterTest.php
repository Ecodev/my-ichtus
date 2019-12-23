<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Service\Importer;
use Genkgo\Camt\Exception\ReaderException;
use PHPUnit\Framework\TestCase;

class ImporterTest extends TestCase
{
    /**
     * @var string
     */
    private $previousTimeZone;

    public function setUp(): void
    {
        $this->previousTimeZone = date_default_timezone_get();
        date_default_timezone_set('Europe/Zurich');
    }

    public function tearDown(): void
    {
        date_default_timezone_set($this->previousTimeZone);

        // Be sure to clear created object from memory
        _em()->clear();
    }

    /**
     * @param string $filename
     *
     * @return array
     */
    private function import(string $filename): array
    {
        $importer = new Importer();

        return $this->extract($importer->import($filename));
    }

    public function testImportMinimal(): void
    {
        $actual = $this->import('tests/data/importer/minimal.xml');
        $expected = require 'tests/data/importer/minimal.php';

        self::assertSame($expected, $actual);
    }

    public function testImport(): void
    {
        $actual = $this->import('tests/data/importer/two-transactions.xml');
        $expected = require 'tests/data/importer/two-transactions.php';

        self::assertSame($expected, $actual);
    }

    public function testThrowWhenFileDoesNotExist(): void
    {
        $this->expectException(ReaderException::class);
        $this->import('/this/surely/is/a/non/existing/file');
    }

    public function testThrowMissingAcctSvcrRef(): void
    {
        $this->expectExceptionMessage('Cannot import a transaction without a account servicer reference to store a universal identifier.');
        $this->import('tests/data/importer/missing-AcctSvcrRef.xml');
    }

    public function testThrowInvalidIban(): void
    {
        $this->expectExceptionMessage('The CAMT file contains a statement for account with IBAN `CH2133685416723344187`, but no account exist for that IBAN in the database. Either create/update a corresponding account, or import a different CAMT file.');
        $this->import('tests/data/importer/invalid-iban.xml');
    }

    public function testThrowInvalidUser(): void
    {
        $this->expectExceptionMessage('Could not find a matching user for reference number `800826000000000000000099994`.');
        $this->import('tests/data/importer/invalid-user.xml');
    }

    /**
     * @param null|Account|User $o
     *
     * @return string
     */
    private function nameOrNull($o): ?string
    {
        return $o ? $o->getName() : null;
    }

    /**
     * @param Transaction[] $transactions
     *
     * @return array
     */
    private function extract(array $transactions): array
    {
        $result = [];

        foreach ($transactions as $transaction) {
            $result[] = $this->extractTransaction($transaction);
        }

        return $result;
    }

    private function extractTransaction(Transaction $transaction): array
    {
        $lines = [];
        /** @var TransactionLine $line */
        foreach ($transaction->getTransactionLines() as $line) {
            $lines[] = $this->extractLine($line);
        }

        $result = [
            'name' => $transaction->getName(),
            'remarks' => $transaction->getRemarks(),
            'internalRemarks' => $transaction->getInternalRemarks(),
            'datatransRef' => $transaction->getDatatransRef(),
            'transactionDate' => $transaction->getTransactionDate()->toIso8601String(),
            'owner' => $this->nameOrNull($transaction->getOwner()),
            'transactionLines' => $lines,
        ];

        return $result;
    }

    private function extractLine(TransactionLine $line): array
    {
        $result = [
            'importedId' => $line->getImportedId(),
            'name' => $line->getName(),
            'remarks' => $line->getRemarks(),
            'transactionDate' => $line->getTransactionDate()->toIso8601String(),
            'balance' => $line->getBalance()->getAmount(),
            'owner' => $this->nameOrNull($line->getOwner()),
            'debit' => $this->nameOrNull($line->getDebit()),
            'credit' => $this->nameOrNull($line->getCredit()),
        ];

        return $result;
    }
}
