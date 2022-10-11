<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\Log;
use Application\Model\User;
use Application\Repository\LogRepository;

class LogRepositoryTest extends AbstractRepositoryTest
{
    private LogRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Log::class);
    }

    public function testLoginFailedOften(): void
    {
        $this->getEntityManager()->getConnection()->executeStatement('DELETE FROM log');
        _log()->info(LogRepository::LOGIN_FAILED);

        $result = $this->repository->loginFailedOften();
        self::assertFalse($result);

        foreach (range(1, 20) as $i) {
            _log()->info(LogRepository::LOGIN_FAILED);
        }

        $result = $this->repository->loginFailedOften();
        self::assertTrue($result, 'is your PHP date.timezone setting correct ?');
    }

    public function testUpdatePasswordFailedOften(): void
    {
        $this->getEntityManager()->getConnection()->executeStatement('DELETE FROM log');
        _log()->info(LogRepository::UPDATE_PASSWORD_FAILED);

        $result = $this->repository->updatePasswordFailedOften();
        self::assertFalse($result);

        foreach (range(1, 20) as $i) {
            _log()->info(LogRepository::UPDATE_PASSWORD_FAILED);
        }

        $result = $this->repository->updatePasswordFailedOften();
        self::assertTrue($result, 'is your PHP date.timezone setting correct ?');
    }

    public function testDeleteOldLogs(): void
    {
        _em()->rollBack();
        $result = $this->repository->deleteOldLogs();
        _em()->beginTransaction();
        self::assertSame(0, $result);
    }
}
