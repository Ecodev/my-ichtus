<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Sorting;

use Application\Model\ExpenseClaim;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Sorting\AbstractSorting;

class LatestModificationTest extends AbstractSorting
{
    protected function tearDown(): void
    {
        User::setCurrent(null);
    }

    public function testSorting(): void
    {
        /** @var User $user */
        $user = _em()->getRepository(User::class)->getOneByLogin('member');
        User::setCurrent($user);

        $result = $this->getSortedQueryResult(_types(), ExpenseClaim::class, 'latestModification');
        self::assertSame([
            7005,
            7002,
            7001,
            7000,
            7003,
        ], $result);
    }
}
