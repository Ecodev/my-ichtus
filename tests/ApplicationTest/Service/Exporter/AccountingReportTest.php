<?php

declare(strict_types=1);

namespace ApplicationTest\Service\Exporter;

use Application\Model\Account;
use Application\Repository\AccountRepository;
use Application\Service\Exporter\AccountingReport;
use ApplicationTest\Traits\TestWithSpreadsheet;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Cake\Chronos\ChronosDate;
use PHPUnit\Framework\TestCase;

class AccountingReportTest extends TestCase
{
    use TestWithSpreadsheet;
    use TestWithTransactionAndUser;

    public function testExportAccountingReport(): void
    {
        $this->setCurrentUser('responsible');

        $hostname = 'my-ichtus.lan';

        $accountingConfig = [
            'customerDepositsAccountCode' => 2030,
            'report' => [
                'showAccountsWithZeroBalance' => false,
                'maxAccountDepth' => 3,
            ],
        ];

        // Query to generate the Excel file on disk
        /** @var AccountRepository $repository */
        $repository = _em()->getRepository(Account::class);
        $results = $repository->getAccountsForReport($accountingConfig, new ChronosDate('2019-12-31'));

        /**
         * TEST REPORT WITH BALANCE AT SELECTED DATE.
         */
        $handler = new AccountingReport($hostname);
        $handler->setDate(new ChronosDate('2019-12-31'));
        $url = $handler->export($results);

        $spreadsheet = $this->readExport($hostname, $url);
        $sheet = $spreadsheet->getActiveSheet();

        // Test a few arbitrary data
        self::assertSame('my-ichtus.lan: rapport comptable au 31.12.2019', $sheet->getCell('A1')->getCalculatedValue());
        self::assertSame('Actifs', $sheet->getCell('A3')->getCalculatedValue());
        self::assertSame('Passifs', $sheet->getCell('E3')->getCalculatedValue());
        self::assertSame('Charges', $sheet->getCell('A19')->getCalculatedValue());
        self::assertSame('Profits', $sheet->getCell('E19')->getCalculatedValue());
        self::assertSame(35187.50, $sheet->getCell('C5')->getCalculatedValue());
        self::assertSame(240.0, $sheet->getCell('C28')->getCalculatedValue());

        /**
         *  TEST REPORT WITH BALANCE AT SELECTED DATE + BUDGET COLUMNS.
         */
        $results = $repository->getAccountsForReport($accountingConfig, new ChronosDate('2019-12-31'), new ChronosDate('2018-12-31'));
        $handler = new AccountingReport($hostname);
        $handler->setDate(new ChronosDate('2019-12-31'));
        $handler->showBudget(true);
        $handler->setDatePrevious(new ChronosDate('2018-12-31'));
        $url = $handler->export($results);

        $spreadsheet = $this->readExport($hostname, $url);
        $sheet = $spreadsheet->getActiveSheet();

        // Tests data from budget columns
        self::assertSame('31.12.2018', $sheet->getCell('D4')->getCalculatedValue(), 'assets, headers, previous balance');
        self::assertSame('Budget prévu', $sheet->getCell('E4')->getCalculatedValue(), 'assets, headers, budget allowed');
        self::assertSame('Budget restant', $sheet->getCell('M4')->getCalculatedValue(), 'liabilities, headers, budget balance');
    }
}
