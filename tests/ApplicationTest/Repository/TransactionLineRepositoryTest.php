<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\TransactionLine;
use Application\Repository\TransactionLineRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;

/**
 * @group Repository
 */
class TransactionLineRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    /**
     * @var TransactionLineRepository
     */
    private $repository;

    public function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(TransactionLine::class);
    }

    public function providerGetAccessibleSubQuery(): array
    {
        $all = range(14000, 14011);

        return [
            ['anonymous', []],
            ['bookingonly', []],
            ['individual', []],
            ['member', [14000, 14002, 14003, 14004, 14008, 14011]],
            ['responsible', $all],
            ['administrator', $all],
        ];
    }
}
