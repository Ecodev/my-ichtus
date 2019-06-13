<?php

declare(strict_types=1);

namespace ApplicationTest\Action;

use Application\Action\ExportTransactionLinesAction;
use Application\Model\TransactionLine;
use ApplicationTest\Traits\TestWithTransaction;
use PHPUnit\Framework\TestCase;

class ExcelExportActionTest extends TestCase
{
    use TestWithTransaction;

    public function testExportTransactionLines(): void
    {
        // Query to generate the Excel file
        $hostname = 'my-ichtus.lan';
        $qb = _em()->getRepository(TransactionLine::class)->createQueryBuilder('tl');
        $action = new ExportTransactionLinesAction($hostname);
        $url = $action->generate($qb->getQuery());

        $this->assertStringStartsWith('https://' . $hostname . '/export/transactionLines/', $url);

        // Try to download the Excel file
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = mb_substr($response, 0, $headerSize);

        $this->assertStringContainsStringIgnoringCase('content-disposition: attachment; filename=Ichtus_compta_ecritures', $header);
        $this->assertStringContainsStringIgnoringCase('content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $header);
        $this->assertRegExp('/content\-length: [1-9][0-9]+/', $header);
    }
}
