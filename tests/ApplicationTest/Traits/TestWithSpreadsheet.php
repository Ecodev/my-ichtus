<?php

declare(strict_types=1);

namespace ApplicationTest\Traits;

use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use ZipArchive;

trait TestWithSpreadsheet
{
    abstract public static function assertTrue($condition, string $message = ''): void;

    abstract public static function assertStringStartsWith(string $prefix, string $string, string $message = ''): void;

    abstract public static function assertFileExists(string $filename, string $message = ''): void;

    private function readExport(string $hostname, string $url): Spreadsheet
    {
        $baseUrl = 'https://' . $hostname . '/data/export/';

        self::assertStringStartsWith($baseUrl, $url, 'must be absolute URL');

        // Make sure the XLSX file was generated on disk
        $path = 'htdocs/data/export/' . str_replace($baseUrl, '', $url);
        self::assertFileExists($path, 'exported file must exist on disk');

        return $this->readSpreadsheet($path);
    }

    private function readSpreadsheet(string $filename): Spreadsheet
    {
        // Assert that it is a valid ZIP file to prevent PhpSpreadsheet from hanging
        $zip = new ZipArchive();
        $res = $zip->open($filename, ZipArchive::CHECKCONS);
        self::assertTrue($res, 'exported Excel should be a valid ZIP file');
        $zip->close();

        // Re-read it
        $reader = new Xlsx();
        $spreadsheet = $reader->load($filename);
        unlink($filename);

        return $spreadsheet;
    }
}
