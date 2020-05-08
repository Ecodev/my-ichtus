<?php

declare(strict_types=1);

namespace ApplicationTest\Action;

use Application\Action\ExportTransactionLinesAction;
use Application\Model\TransactionLine;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Laminas\Diactoros\ServerRequest;
use PHPUnit\Framework\TestCase;
use Psr\Http\Server\RequestHandlerInterface;

class ExcelExportActionTest extends TestCase
{
    use TestWithTransactionAndUser;

    public function testExportTransactionLines(): void
    {
        // Query to generate the Excel file on disk
        $hostname = 'my-ichtus.lan';
        $qb = _em()->getRepository(TransactionLine::class)->createQueryBuilder('tl');
        $action = new ExportTransactionLinesAction($hostname);
        $url = $action->generate($qb->getQuery());

        $baseUrl = 'https://' . $hostname . '/export/transactionLines/';

        $this->assertStringStartsWith($baseUrl, $url);

        preg_match('#' . $baseUrl . '([0-9a-f]+)/(.+)#', $url, $m);

        // Make sure the XLSX file was generated on disk
        $fpath = 'data/tmp/excel/' . $m[1];
        $this->assertFileExists($fpath);
        $size = filesize($fpath);

        // Test middleware action to download the Excel file
        $action = new ExportTransactionLinesAction('my-ichtus.lan');
        // Mock route parsing: /export/transactionLines/{key:[0-9a-f]+}/{name:.+\.xlsx}
        $request = (new ServerRequest())->withAttribute('key', $m[1])->withAttribute('name', $m[2]);

        $handler = $this->createMock(RequestHandlerInterface::class);

        $response = $action->process($request, $handler);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertStringContainsString('attachment; filename=Ichtus_compta_ecritures', $response->getHeaderLine('content-disposition'));
        $this->assertEquals($size, $response->getHeaderLine('content-length'));
    }
}
