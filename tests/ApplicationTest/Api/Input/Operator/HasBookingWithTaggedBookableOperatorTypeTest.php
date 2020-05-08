<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\BookableTag;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingWithTaggedBookableOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            [1, [6008]],
            [2, [6007]],
            [1, [6005]],
            [3, [6005, 6007]],
            [0, [6000]],
        ];
    }

    /**
     * @dataProvider providerGetDqlCondition
     *
     * @param int $expected
     * @param array $tags
     */
    public function testGetDqlCondition(int $expected, array $tags): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $this->idsToEntityIds(BookableTag::class, $tags),
        ];
        $actual = $this->getFilteredResult(User::class, 'custom', 'hasBookingWithTaggedBookable', $values);
        self::assertCount($expected, $actual);
    }
}
