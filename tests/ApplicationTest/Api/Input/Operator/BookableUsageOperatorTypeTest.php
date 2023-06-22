<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class BookableUsageOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): iterable
    {
        yield 'bookables rented by that user' => [9, [1002], false];
        yield 'bookables rented by that other user' => [3, [1008], false];
        yield 'bookables not rented by that user' => [9, [1008], true];
        yield 'bookables not rented at all' => [13, [], false];
        yield 'bookables rented to anybody' => [12, [], true];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, array $users, bool $not): void
    {
        $values = [
            'values' => $this->idsToEntityIds(User::class, $users),
            'not' => $not,
        ];

        $actual = $this->getFilteredResult(Bookable::class, 'custom', 'bookableUsage', $values);
        self::assertCount($expected, $actual);
    }
}
