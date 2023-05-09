<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\DBAL\Types\BookingStatusType;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingStatusOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): iterable
    {
        yield 'users with application' => [3, [BookingStatusType::APPLICATION], null];
        yield 'users with booked' => [4, [BookingStatusType::BOOKED], null];
        yield 'users with both' => [4, [BookingStatusType::BOOKED], null];
        yield 'users with processed' => [0, [BookingStatusType::PROCESSED], null];
        yield 'users without application' => [4, [BookingStatusType::APPLICATION], true];
        yield 'users with any booking status' => [4, null, true];
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
