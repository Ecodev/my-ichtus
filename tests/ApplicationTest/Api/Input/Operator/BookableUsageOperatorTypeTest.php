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
            [8, [1002]],
            [1, [1008]],
            [0, []],
            [8, [1008], true],
            [9, [], false],
            [9, [], true],
        ];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, array $users, ?bool $not = null): void
    {
        $values = [
            'values' => $this->idsToEntityIds(User::class, $users),
        ];
        if (is_bool($not)) {
            $values['not'] = $not;
        }
        $actual = $this->getFilteredResult(Bookable::class, 'custom', 'bookableUsage', $values);
        self::assertCount($expected, $actual);
    }
}
