<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Service\Bvr;
use PHPUnit\Framework\TestCase;

class BvrTest extends TestCase
{
    /**
     * @dataProvider providerGetReferenceNumber
     */
    public function testGetReferenceNumber(string $bankAccount, string $referenceNumber, string $expected): void
    {
        $actual = Bvr::getReferenceNumber($bankAccount, $referenceNumber);
        self::assertSame($expected, $actual);
    }

    public function providerGetReferenceNumber()
    {
        return [
            ['123456', '', '123456000000000000000000006'],
            ['123456', '789', '123456000000000000000007891'],
        ];
    }

    public function testGetReferenceNumberMustThrowIfTooLongBankAccount(): void
    {
        $this->expectExceptionMessage('Invalid bank account. It must be exactly 6 digits, but got: `1234567`');
        Bvr::getReferenceNumber('1234567', '123');
    }

    public function testGetReferenceNumberMustThrowIfTooLongReferenceNumber(): void
    {
        $this->expectExceptionMessage('Invalid custom ID. It must be 20 or less digits, but got: `000000000000000000000`');
        Bvr::getReferenceNumber('123456', str_repeat('0', 21));
    }

    public function testGetReferenceNumberMustThrowIfInvalidReferenceNumber(): void
    {
        $this->expectExceptionMessage('Invalid custom ID. It must be 20 or less digits, but got: `1.5`');
        Bvr::getReferenceNumber('123456', '1.5');
    }

    /**
     * @dataProvider providerModulo10
     */
    public function testModulo10(string $number, int $expected): void
    {
        $actual = Bvr::modulo10($number);
        self::assertSame($expected, $actual);
    }

    public function providerModulo10()
    {
        return [
            ['', 0],
            ['0', 0],
            ['04', 2],
            ['010000394975', 3],
            ['313947143000901', 8],
            ['80082600000000000000000201', 6],
            ['80082600000000000000000001', 2],
            ['80082600000000000000000002', 8],
            ['80082600000000000000000003', 3],
            ['80082600000000000000000004', 9],
            ['80082600000000000000000005', 7],
            ['80082600000000000000000006', 5],
            ['80082600000000000000000007', 0],
            ['80082600000000000000000008', 1],
            ['80082600000000000000000009', 6],
            ['80082600000000000000000010', 8],
        ];
    }

    /**
     * @dataProvider providerGetEncodingLine
     */
    public function testGetEncodingLine(string $bankAccount, string $referenceNumber, string $postalAccount, ?string $amount, string $expected): void
    {
        $actual = Bvr::getEncodingLine($bankAccount, $referenceNumber, $postalAccount, $amount);
        self::assertSame($expected, $actual);
    }

    public function providerGetEncodingLine()
    {
        return [
            ['800826', '00000000000000000201', '01-4567-0', null, '042>800826000000000000000002016+ 010045670>'],
            ['000000', '', '1-2-3', null, '042>000000000000000000000000000+ 010000023>'],
            ['000000', '123', '01-4567-0', '1.45', '0100000001453>000000000000000000000001236+ 010045670>'],
        ];
    }

    public function testGetEncodingLineMustThrowIfTooLongReference(): void
    {
        $this->expectExceptionMessage('Invalid custom ID. It must be 20 or less digits, but got: `000000000000000000000000000`');
        Bvr::getEncodingLine('123456', str_repeat('0', 27), '01-4567-0');
    }

    public function testGetEncodingLineMustThrowIfInvalidReference(): void
    {
        $this->expectExceptionMessage('Invalid custom ID. It must be 20 or less digits, but got: `0.0`');
        Bvr::getEncodingLine('123456', '0.0', '01-4567-0');
    }

    public function testGetEncodingLineMustThrowIfInvalidPostAccount(): void
    {
        $this->expectExceptionMessage('Invalid post account number');
        Bvr::getEncodingLine('123456', '0', '0145670');
    }

    public function testGetEncodingLineMustThrowIfTooLongPostAccount(): void
    {
        $this->expectExceptionMessage('The post account number is too long');
        Bvr::getEncodingLine('123456', '0', '0123-456789-0');
    }

    public function testGetEncodingLineMustThrowIfInvalidAmount(): void
    {
        $this->expectExceptionMessage('Invalid amount. Must be numeric, but got: `foo`');
        Bvr::getEncodingLine('123456', '0', '01-4567-0', 'foo');
    }
}
