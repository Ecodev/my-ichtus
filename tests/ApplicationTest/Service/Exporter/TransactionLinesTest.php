<?php

declare(strict_types=1);

namespace ApplicationTest\Service\Exporter;

use Application\Model\TransactionLine;
use Application\Service\Exporter\TransactionLines;
use ApplicationTest\Traits\TestWithSpreadsheet;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use PHPUnit\Framework\TestCase;

class TransactionLinesTest extends TestCase
{
    use TestWithSpreadsheet;
    use TestWithTransactionAndUser;

    public function testExportTransactionLines(): void
    {
        $this->setCurrentUser('responsible');

        // Query to generate the Excel file on disk
        $hostname = 'my-ichtus.lan';
        $qb = _em()->getRepository(TransactionLine::class)->createQueryBuilder('tl');
        $handler = new TransactionLines($hostname);
        $result = $qb->getQuery()->getResult();

        $url = $handler->export($result);

        $spreadsheet = $this->readExport($hostname, $url);
        $sheet = $spreadsheet->getActiveSheet();

        // Test a few arbitrary data
        self::assertSame('Date', $sheet->getCell('A1')->getCalculatedValue());
        self::assertSame('Pointé', $sheet->getCell('M1')->getCalculatedValue());
        self::assertSame('Inscription cours nautique Active Member', $sheet->getCell('C2')->getCalculatedValue());
        self::assertSame(45562.5, $sheet->getCell('L14')->getCalculatedValue());
    }
}
