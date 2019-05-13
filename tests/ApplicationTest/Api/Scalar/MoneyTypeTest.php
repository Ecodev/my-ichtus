<?php

declare(strict_types=1);

namespace OKpilotTest\Api\Scalar;

use Application\Api\Scalar\MoneyType;
use GraphQL\Error\Error;
use GraphQL\Language\AST\StringValueNode;
use Money\Money;
use PHPUnit\Framework\TestCase;

class MoneyTypeTest extends TestCase
{
    public function testSerialize(): void
    {
        $type = new MoneyType();

        $money = Money::CHF('995');
        $actual = $type->serialize($money);
        self::assertSame('9.95', $actual);
    }

    /**
     * @dataProvider providerValues
     */
    public function testParseValue(string $input, Money $expected): void
    {
        $type = new MoneyType();

        $actual = $type->parseValue($input);
        self::assertInstanceOf(Money::class, $actual);
        self::assertTrue($expected->equals($actual));
    }

    /**
     * @dataProvider providerValues
     *
     * @param null|string $input
     */
    public function testParseLiteral(string $input, Money $expected): void
    {
        $type = new MoneyType();
        $ast = new StringValueNode(['value' => $input]);

        $actual = $type->parseLiteral($ast);
        self::assertInstanceOf(Money::class, $actual);
        self::assertTrue($expected->equals($actual));
    }

    /**
     * @dataProvider providerInvalidValues
     */
    public function testParseValueThrowsWithInvalidValue(string $invalidValue): void
    {
        $type = new MoneyType();

        $this->expectException(Error::class);
        $type->parseValue($invalidValue);
    }

    /**
     * @dataProvider providerInvalidValues
     */
    public function testParseLiteralThrowsWithInvalidValue(string $invalidValue): void
    {
        $type = new MoneyType();
        $ast = new StringValueNode(['value' => $invalidValue]);

        $this->expectException(Error::class);
        $type->parseLiteral($ast);
    }

    public function providerValues(): array
    {
        return [
            ['2', Money::CHF(200)],
            ['2.95', Money::CHF(295)],
            ['0', Money::CHF(0)],
            ['9.00', Money::CHF(900)],
        ];
    }

    public function providerInvalidValues(): array
    {
        return [
            'non numeric' => ['foo'],
            'too many decimals' => ['1.123'],
            'exponential' => ['1e10'],
            'empty string' => [''],
        ];
    }
}
