<?php

declare(strict_types=1);

namespace ApplicationTest;

use Money\Money;

class Assert
{
    /**
     * Assert that money is equal.
     */
    public static function assertMoney(Money $expected, Money $actual, string $message = ''): void
    {
        \PHPUnit\Framework\Assert::assertSame($expected->getCurrency()->getCode(), $actual->getCurrency()->getCode(), $message);
        \PHPUnit\Framework\Assert::assertSame($expected->getAmount(), $actual->getAmount(), $message);
    }
}
