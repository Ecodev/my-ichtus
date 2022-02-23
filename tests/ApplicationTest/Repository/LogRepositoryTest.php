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

    public function testGetLoginDate(): void
    {
        $user = $this->getEntityManager()->getRepository(User::class)->getOneByLogin('administrator');
        User::setCurrent($user);

        $logs = [
            [
                'creator_id' => $user->getId(),
                'creation_date' => '2019-01-01',
                'message' => LogRepository::LOGIN_FAILED,
            ],
            [
                'creator_id' => 1003,
                'creation_date' => '2019-01-02',
                'message' => LogRepository::LOGIN,
            ],
            [
                'creator_id' => $user->getId(),
                'creation_date' => '2019-01-03',
                'message' => LogRepository::LOGIN,
            ],
            [
                'creator_id' => $user->getId(),
                'creation_date' => '2019-01-04',
                'message' => LogRepository::LOGIN,
            ],
        ];

        foreach ($logs as $log) {
            $this->getEntityManager()->getConnection()->insert('log', $log);
        }

        $firstLogin = $this->repository->getLoginDate($user, true);
        self::assertSame('2019-01-03', $firstLogin->toDateString());

        $lastLogin = $this->repository->getLoginDate($user, false);
        self::assertSame('2019-01-04', $lastLogin->toDateString());

        $otherUser = $this->getEntityManager()->getRepository(User::class)->getOneByLogin('member');
        $never = $this->repository->getLoginDate($otherUser, false);
        self::assertNull($never);
    }
}
