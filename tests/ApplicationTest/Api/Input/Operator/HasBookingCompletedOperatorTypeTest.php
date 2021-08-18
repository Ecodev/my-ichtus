<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\DBAL\Types\BookingStatusType;
use Application\Model\Bookable;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingCompletedOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            'users with completed bookings' => [1, [true], false],
            'users with uncompleted bookings' => [4, [false], false],
            'users with completed and uncompleted bookings' => [4, [true, false], false],
        ];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
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
}
