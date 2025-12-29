<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;
use PHPUnit\Framework\Attributes\DataProvider;

class HasBookingCompletedOperatorTypeTest extends OperatorType
{
    #[DataProvider('providerGetDqlCondition')]
    public function testGetDqlCondition(int $expected, ?array $values, ?bool $not): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $values,
            'not' => $not,
        ];
        $actual = $this->getFilteredResult(User::class, 'custom', 'hasBookingCompleted', $values);
        self::assertCount($expected, $actual);
    }

    public static function providerGetDqlCondition(): iterable
    {
        yield 'users with completed bookings' => [2, [true], false];
        yield 'users with uncompleted bookings' => [6, [false], false];
        yield 'users with completed and uncompleted bookings' => [6, [true, false], false];
    }
}
