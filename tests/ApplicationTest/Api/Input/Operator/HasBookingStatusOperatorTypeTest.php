<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\DBAL\Types\BookingStatusType;
use Application\Model\Bookable;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingStatusOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            'users with application' => [1, [BookingStatusType::APPLICATION], null],
            'users with booked' => [4, [BookingStatusType::BOOKED], null],
            'users with both' => [4, [BookingStatusType::BOOKED], null],
            'users with processed' => [0, [BookingStatusType::PROCESSED], null],
            'users without application' => [4, [BookingStatusType::APPLICATION], true],
            'users with any booking status' => [4, null, true],
        ];
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
