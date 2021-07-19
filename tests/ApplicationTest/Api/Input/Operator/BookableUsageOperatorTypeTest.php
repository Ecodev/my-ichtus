<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class BookableUsageOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            'bookables rented by that user' => [9, [1002], false],
            'bookables rented by that other user' => [2, [1008], false],
            'bookables not rented by that user' => [9, [1008], true],
            'bookables not rented at all' => [13, [], false],
            'bookables rented to anybody' => [11, [], true],
        ];
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
