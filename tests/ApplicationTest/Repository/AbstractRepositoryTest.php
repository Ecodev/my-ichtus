<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use ApplicationTest\Traits\TestWithTransaction;
use PHPUnit\Framework\TestCase;

/**
 * @group Repository
 */
abstract class AbstractRepositoryTest extends TestCase
{
    use TestWithTransaction;

    protected function assertAccountBalance(int $id, int $expected, string $message): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $actual = $connection->fetchColumn('SELECT balance FROM account WHERE id = ' . $id);
        self::assertSame($expected, (int) $actual, $message);
    }
}
