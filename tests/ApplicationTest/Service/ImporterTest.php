<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Service\Importer;
use PHPUnit\Framework\TestCase;

class ImporterTest extends TestCase
{
    /**
     * @var string
     */
    private $previousTimeZone;

    protected function setUp(): void
    {
        $this->previousTimeZone = date_default_timezone_get();
        date_default_timezone_set('Europe/Zurich');
    }

    protected function tearDown(): void
    {
        date_default_timezone_set($this->previousTimeZone);

        // Be sure to clear created object from memory
        _em()->clear();
    }

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
        $this->expectExceptionMessage('/this/surely/is/a/non/existing/file does not exists');
        $this->import('/this/surely/is/a/non/existing/file');
    }

    public function testThrowMissingAcctSvcrRef(): void
    {
        $this->expectExceptionMessage('Cannot import a transaction without an end-to-end ID or an account servicer reference to store a universal identifier.');
        $this->import('tests/data/importer/missing-EndToEndId-and-AcctSvcrRef.xml');
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

    public function testThrowInvalidCamtFormat(): void
    {
        $this->expectExceptionMessage('The format CAMT 054 is expected, but instead we got: camt.053.001.04');
        $this->import('tests/data/importer/invalid-camt-format.xml');
    }

    public function testThrowDuplicatedImport(): void
    {
        $this->expectExceptionMessage('It looks like this file was already imported. A transaction line with the following `importedId` was already imported once and cannot be imported again: my-unique-imported-id');
        $this->import('tests/data/importer/duplicated-importedId.xml');
    }

    public function testThrowInvalidXml(): void
    {
        $this->expectExceptionMessage('Unsupported format, cannot find message format with xmlns');
        $this->import('tests/data/importer/invalid-xml.xml');
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
