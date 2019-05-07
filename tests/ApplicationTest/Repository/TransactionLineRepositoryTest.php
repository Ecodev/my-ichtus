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

    public function testTriggers(): void
    {
        $account1 = 10096;
        $account2 = 10037;
        $account3 = 10085;
        $account4 = 10025;

        $this->assertAccountBalance($account1, '50.00', 'initial balance');
        $this->assertAccountBalance($account2, '100.00', 'initial balance');
        $this->assertAccountBalance($account3, '12.50', 'initial balance');
        $this->assertAccountBalance($account4, '8187.50', 'initial balance');

        $connection = $this->getEntityManager()->getConnection();
        $connection->insert('transaction_line', [
            'transaction_id' => 8000,
            'debit_id' => $account1,
            'credit_id' => $account2,
            'balance' => '5.00',
        ]);

        $id = $connection->lastInsertId();

        $this->assertAccountBalance($account1, '45.00', 'balance should be reduced when line is inserted');
        $this->assertAccountBalance($account2, '105.00', 'balance should be increased when line is inserted');

        $count = $connection->update('transaction_line',
            [
                'balance' => '40.00',
            ],
            [
                'id' => $id,
            ]
        );
        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, '10.00', 'balance should be reduced even more after update');
        $this->assertAccountBalance($account2, '140.00', 'balance should be increased even more after update');

        $count = $connection->update('transaction_line',
            [
                'debit_id' => $account3,
                'credit_id' => $account4,
            ],
            [
                'id' => $id,
            ]
        );
        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, '50.00', 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account2, '100.00', 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account3, '52.50', 'balance should be increased after swapped account');
        $this->assertAccountBalance($account4, '8147.50', 'balance should be reduced after swapped account');

        $count = $connection->delete('transaction_line', ['id' => $id]);
        self::assertSame(1, $count);
        $this->assertAccountBalance($account1, '50.00', 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account2, '100.00', 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account3, '12.50', 'balance should be restored to its original value after deletion');
        $this->assertAccountBalance($account4, '8187.50', 'balance should be restored to its original value after deletion');
    }
}
