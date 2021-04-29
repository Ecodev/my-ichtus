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
            'bookables rented by that user' => [8, [1002], false],
            'bookables rented by that other user' => [1, [1008], false],
            'bookables not rented by that user' => [8, [1008], true],
            'bookables not rented at all' => [9, [], false],
            'bookables rented to anybody' => [9, [], true],
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
