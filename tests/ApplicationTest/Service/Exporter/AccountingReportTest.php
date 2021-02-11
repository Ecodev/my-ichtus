<?php

declare(strict_types=1);

namespace ApplicationTest\Service\Exporter;

use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Service\Exporter\AccountingReport;
use ApplicationTest\Traits\TestWithSpreadsheet;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Cake\Chronos\Date;
use PHPUnit\Framework\TestCase;

class AccountingReportTest extends TestCase
{
    use TestWithTransactionAndUser;
    use TestWithSpreadsheet;

    public function testExportAccountingReport(): void
    {
        /** @var User $user */
        $user = _em()->getRepository(User::class)->getOneByLogin('responsible');
        User::setCurrent($user);

        $hostname = 'my-ichtus.lan';

        $accountingConfig = [
            'salesAccountCode' => 3200,
            'bankAccountCode' => 1020,
            'customerDepositsAccountCode' => 2030,
            'report' => [
                'showAccountsWithZeroBalance' => true,
                'maxAccountDepth' => 2,
            ],
        ];

        // Query to generate the Excel file on disk
        /** @var AccountRepository $repository */
        $repository = _em()->getRepository(Account::class);
        $query = $repository->getRootAccountsQuery();

        $handler = new AccountingReport($hostname, $accountingConfig);
        $handler->setDate(new Date('2019-12-31'));
        $url = $handler->export($query->getResult());

        $spreadsheet = $this->readExport($hostname, $url);
        $sheet = $spreadsheet->getActiveSheet();

        // Test a few arbitrary data
        self::assertSame('my-ichtus.lan: rapport comptable au 31.12.2019', $sheet->getCell('A1')->getCalculatedValue());
        self::assertSame('Actifs', $sheet->getCell('A3')->getCalculatedValue());
        self::assertSame('Passifs', $sheet->getCell('E3')->getCalculatedValue());
        self::assertSame('Charges', $sheet->getCell('I3')->getCalculatedValue());
        self::assertSame('Profits', $sheet->getCell('M3')->getCalculatedValue());
        self::assertSame(35187.50, $sheet->getCell('C44')->getCalculatedValue());
        self::assertSame(240.0, $sheet->getCell('M44')->getCalculatedValue());
    }
}
