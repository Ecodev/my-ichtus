<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Enum\BookingStatus;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingStatusOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): iterable
    {
        yield 'users with application' => [3, [BookingStatus::Application], null];
        yield 'users with booked' => [4, [BookingStatus::Booked], null];
        yield 'users with both' => [4, [BookingStatus::Booked], null];
        yield 'users with processed' => [1, [BookingStatus::Processed], null];
        yield 'users without application' => [5, [BookingStatus::Application], true];
        yield 'users with any booking status' => [6, null, true];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, ?array $status, ?bool $not): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $status,
            'not' => $not,
        ];
        $actual = $this->getFilteredResult(User::class, 'custom', 'hasBookingStatus', $values);
        self::assertCount($expected, $actual);
    }
}
