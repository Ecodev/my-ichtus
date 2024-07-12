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
            'salesAccountCode' => 3200,
            'bankAccountCode' => 1020,
            'customerDepositsAccountCode' => 2030,
            'report' => [
                'showAccountsWithZeroBalance' => true,
                'maxAccountDepth' => 2,
                'accountClasses' => [
                    'assets' => ['1'],
                    'liabilities' => ['2'],
                    'revenues' => ['3'],
                    'expenses' => ['4', '5', '6'],
                    'equity' => ['7', '8', '9'],
                ],
            ],
        ];

        // Query to generate the Excel file on disk
        /** @var AccountRepository $repository */
        $repository = _em()->getRepository(Account::class);
        $query = $repository->getRootAccountsQuery();

        /**
         * TEST REPORT WITH BALANCE AT SELECTED DATE.
         */
        $handler = new AccountingReport($hostname, $accountingConfig);
        $handler->setDate(new ChronosDate('2019-12-31'));
        $url = $handler->export($query->getResult());

        $spreadsheet = $this->readExport($hostname, $url);
        $sheet = $spreadsheet->getActiveSheet();

        // Test a few arbitrary data
        self::assertSame('my-ichtus.lan: rapport comptable au 31.12.2019', $sheet->getCell('A1')->getCalculatedValue());
        self::assertSame('Actifs', $sheet->getCell('A3')->getCalculatedValue());
        self::assertSame('Passifs', $sheet->getCell('E3')->getCalculatedValue());
        self::assertSame('Charges', $sheet->getCell('A24')->getCalculatedValue());
        self::assertSame('Profits', $sheet->getCell('E24')->getCalculatedValue());
        self::assertSame(35187.50, $sheet->getCell('C5')->getCalculatedValue());
        self::assertSame(240.0, $sheet->getCell('C69')->getCalculatedValue());

        /**
         *  TEST REPORT WITH BALANCE AT SELECTED DATE + BUDGET COLUMNS.
         */
        $handler = new AccountingReport($hostname, $accountingConfig);
        $handler->setDate(new ChronosDate('2019-12-31'));
        $handler->showBudget(true);
        $url = $handler->export($query->getResult());

        $spreadsheet = $this->readExport($hostname, $url);
        $sheet = $spreadsheet->getActiveSheet();

        // Tests data from budget columns
        self::assertSame('Solde précédent', $sheet->getCell('D4')->getCalculatedValue(), 'assets, headers, previous balance');
        self::assertSame('Budget prévu', $sheet->getCell('E4')->getCalculatedValue(), 'assets, headers, budget allowed');
        self::assertSame('Budget restant', $sheet->getCell('M4')->getCalculatedValue(), 'liabilities, headers, budget balance');
        self::assertSame(500.00, $sheet->getCell('E12')->getCalculatedValue(), '1500 machines budget allowed');
        self::assertSame(500.00, $sheet->getCell('F12')->getCalculatedValue(), '1500 machines leftover balance');
        self::assertSame(87.50, $sheet->getCell('F53')->getCalculatedValue(), '6500 admin leftover budget');
    }
}
