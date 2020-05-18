<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\ExpenseClaim;
use Application\Repository\ExpenseClaimRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;

/**
 * @group Repository
 */
class ExpenseClaimRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    /**
     * @var ExpenseClaimRepository
     */
    private $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(ExpenseClaim::class);
    }

    public function providerGetAccessibleSubQuery(): array
    {
        $all = [7000, 7001, 7002, 7003];

        return [
            ['anonymous', []],
            ['bookingonly', []],
            ['individual', [7003]],
            ['member', [7000, 7001, 7002]],
            ['responsible', $all],
            ['administrator', $all],
        ];
    }
}
