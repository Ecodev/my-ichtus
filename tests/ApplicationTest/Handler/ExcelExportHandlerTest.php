<?php

declare(strict_types=1);

namespace ApplicationTest\Handler;

use Application\Handler\ExportTransactionLinesHandler;
use Application\Model\TransactionLine;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Laminas\Diactoros\ServerRequest;
use PHPUnit\Framework\TestCase;
use Psr\Http\Server\RequestHandlerInterface;

class ExcelExportHandlerTest extends TestCase
{
    use TestWithTransactionAndUser;

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
}
