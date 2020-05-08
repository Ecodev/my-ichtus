<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use ApplicationTest\Traits\TestWithTransactionAndUser;
use PHPUnit\Framework\TestCase;

/**
 * @group Repository
 */
abstract class AbstractRepositoryTest extends TestCase
{
    use TestWithTransactionAndUser;

    protected function assertAccountBalance(int $id, int $expected, string $message): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $actual = $connection->fetchColumn('SELECT balance FROM account WHERE id = ' . $id);
        self::assertSame($expected, (int) $actual, $message);
    }
}
