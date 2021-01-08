<?php

declare(strict_types=1);

namespace ApplicationTest\Handler;

use Application\Handler\ExportAccountingReportHandler;
use Application\Handler\ExportTransactionLinesHandler;
use Application\Model\Account;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Cake\Chronos\Date;
use Laminas\Diactoros\ServerRequest;
use PHPUnit\Framework\TestCase;

class ExcelExportHandlerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $responsible = new User(User::ROLE_RESPONSIBLE);
        $responsible->setLogin('accountant');
        User::setCurrent($responsible);
    }

    public function testExportTransactionLines(): void
    {
        // Query to generate the Excel file on disk
        $hostname = 'my-ichtus.lan';
        $qb = _em()->getRepository(TransactionLine::class)->createQueryBuilder('tl');
        $handler = new ExportTransactionLinesHandler($hostname);
        $url = $handler->generate($qb->getQuery());

        $baseUrl = 'https://' . $hostname . '/export/transactionLines/';

        self::assertStringStartsWith($baseUrl, $url);

        preg_match('#' . $baseUrl . '([0-9a-f]+)/(.+)#', $url, $m);

        // Make sure the XLSX file was generated on disk
        $fpath = 'data/tmp/excel/' . $m[1];
        self::assertFileExists($fpath);
        $size = filesize($fpath);

        // Test handler to download the Excel file
        $handler = new ExportTransactionLinesHandler('my-ichtus.lan');
        // Mock route parsing: /export/transactionLines/{key:[0-9a-f]+}/{name:.+\.xlsx}
        $request = (new ServerRequest())->withAttribute('key', $m[1])->withAttribute('name', $m[2]);

        $response = $handler->handle($request);

        self::assertEquals(200, $response->getStatusCode());
        self::assertStringContainsString('attachment; filename=Ichtus_compta_ecritures', $response->getHeaderLine('content-disposition'));
        self::assertEquals($size, $response->getHeaderLine('content-length'));
    }

    public function testExportAccountingReport(): void
    {
        $hostname = 'my-ichtus.lan';

        $accountingConfig = [
            'stockOfGoodsAccountCode' => 120,
            'salesAccountCode' => 3200,
            'bankAccountCode' => 1020,
            'customerDepositsAccountCode' => 2030,
            'stockVariationAccountCode' => 3900,
            'report' => [
                'showAccountsWithZeroBalance' => true,
                'maxAccountDepth' => 2,
            ],
        ];

        // Query to generate the Excel file on disk
        /** @var AccountRepository $repository */
        $repository = _em()->getRepository(Account::class);
        $query = $repository->getRootAccountsQuery();

        $handler = new ExportAccountingReportHandler($hostname, $accountingConfig);
        $handler->setDate(new Date('2019-12-31'));
        $url = $handler->generate($query);

        $baseUrl = 'https://' . $hostname . '/export/accountingReport/';

        self::assertStringStartsWith($baseUrl, $url);

        preg_match('#' . $baseUrl . '([0-9a-f]+)/(.+)#', $url, $m);

        // Make sure the XLSX file was generated on disk
        $fpath = 'data/tmp/excel/' . $m[1];
        self::assertFileExists($fpath);
        $size = filesize($fpath);

        // Test handler to download the Excel file
        $handler = new ExportAccountingReportHandler($hostname, $accountingConfig);
        $handler->setDate(new Date('2019-12-31'));
        // Mock route parsing: /export/accountingReport/{key:[0-9a-f]+}/{name:.+\.xlsx}
        $request = (new ServerRequest())->withAttribute('key', $m[1])->withAttribute('name', $m[2]);

        $response = $handler->handle($request);

        self::assertEquals(200, $response->getStatusCode());
        self::assertStringContainsString('attachment; filename=my-ichtus.lan_compta_rapport_2019-12-31.xlsx', $response->getHeaderLine('content-disposition'));
        self::assertEquals($size, $response->getHeaderLine('content-length'));
    }
}
