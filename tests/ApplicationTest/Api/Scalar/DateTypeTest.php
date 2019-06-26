<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Scalar;

use Application\Api\Scalar\DateType;
use Cake\Chronos\Date;
use PHPUnit\Framework\TestCase;

class DateTypeTest extends TestCase
{
    public function testTimezoneIsIgnored(): void
    {
        $type = new DateType();
        $actual = $type->parseValue('2010-02-09');
        self::assertInstanceOf(Date::class, $actual);
        self::assertSame('2010-02-09T00:00:00+00:00', $actual->format('c'));

        $actual = $type->parseValue('2010-02-09T23:00:00');
        self::assertInstanceOf(Date::class, $actual);
        self::assertSame('2010-02-09T00:00:00+00:00', $actual->format('c'));

        $actual = $type->parseValue('2010-02-09T02:00:00+08:00');
        self::assertInstanceOf(Date::class, $actual);
        self::assertSame('2010-02-09T00:00:00+00:00', $actual->format('c'), 'timezone should be ignored');

        $date = new Date('2010-02-03');
        $actual = $type->serialize($date);
        self::assertSame('2010-02-03', $actual);
    }
}
