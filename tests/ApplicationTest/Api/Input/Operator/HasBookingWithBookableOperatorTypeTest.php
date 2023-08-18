<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingWithBookableOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): iterable
    {
        yield 'bookable with shared bookings' => [2, [3006], null];
        yield 'also terminated booking' => [1, [3000], null];
        yield 'only each user only once even if multiple bookables' => [2, [3006, 3004], null];
        yield 'bookable with no active booking' => [0, [3005], null];
        yield 'booking without bookable (own equipment)' => [10, null, false];
        yield 'booking with any bookable' => [6, null, true];
        yield 'booking excluding one bookable' => [6, [3003], true];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, ?array $bookables, ?bool $not): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $this->idsToEntityIds(Bookable::class, $bookables),
            'not' => $not,
        ];
        $actual = $this->getFilteredResult(User::class, 'custom', 'hasBookingWithBookable', $values);
        self::assertCount($expected, $actual);
    }
}
