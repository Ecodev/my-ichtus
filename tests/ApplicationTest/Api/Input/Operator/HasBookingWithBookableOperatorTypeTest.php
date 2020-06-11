<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingWithBookableOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            [2, [3006]],
            [0, [3000]],
            [1, [3004]],
            [2, [3006, 3004]], // 2 (instead of 3) because it's a user list and a user is not listed twice
            [0, [3005]],
        ];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, array $bookables): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $this->idsToEntityIds(Bookable::class, $bookables),
        ];
        $actual = $this->getFilteredResult(User::class, 'custom', 'hasBookingWithBookable', $values);
        self::assertCount($expected, $actual);
    }
}
