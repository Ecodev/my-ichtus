<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\User;

class BookableUsageOperatorTypeTest extends AbstractOperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            [8, [1002]],
            [1, [1008]],
            [0, []],
        ];
    }

    /**
     * @dataProvider providerGetDqlCondition
     *
     * @param int $expected
     * @param array $users
     */
    public function testGetDqlCondition(int $expected, array $users): void
    {
        $values = [
            'values' => $this->idsToEntityIds(User::class, $users),
        ];
        $actual = $this->getFilteredResult(Bookable::class, 'custom', 'bookableUsage', $values);
        self::assertCount($expected, $actual);
    }
}
