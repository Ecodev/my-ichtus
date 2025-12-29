<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\ExpenseClaim;
use Application\Repository\ExpenseClaimRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;

class ExpenseClaimRepositoryTest extends AbstractRepository
{
    use LimitedAccessSubQuery;

    private ExpenseClaimRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(ExpenseClaim::class);
    }

    public static function providerGetAccessibleSubQuery(): iterable
    {
        $all = [7000, 7001, 7002, 7003, 7004, 7005];

        $family = [7000, 7001, 7002, 7003, 7005];
        yield ['anonymous', []];
        yield ['bookingonly', []];
        yield ['individual', $family];
        yield ['member', $family];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }
}
