<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Sorting;

use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Sorting\AbstractSorting;

class AgeTest extends AbstractSorting
{
    public function testSorting(): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $result = $this->getSortedQueryResult(_types(), User::class, 'age');
        self::assertSame([
            1004,
            1002,
            1012,
            1013,
            1014,
            1015,
            1010,
            1000,
            1007,
            1001,
            1005,
            1006,
            1008,
            1009,
            1003,
            1011,
        ], $result);
    }
}
