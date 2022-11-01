<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\User;
use Application\Repository\UserRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;

class UserRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    private UserRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(User::class);
    }

    public function providerGetAccessibleSubQuery(): array
    {
        $all = range(1000, 1015);

        return [
            ['anonymous', []],
            ['accounting_verificator', []],
            ['bookingonly', $all],
            ['individual', $all],
            ['member', $all],
            ['trainer', $all],
            ['formationresponsible', $all],
            ['responsible', $all],
            ['administrator', $all],
        ];
    }

    public function testGetOneByLoginPassword(): void
    {
        self::assertNull($this->repository->getOneByLoginPassword('foo', 'bar'), 'wrong user');
        self::assertNull($this->repository->getOneByLoginPassword('administrator', 'bar'), 'wrong password');

        $user = $this->repository->getOneByLoginPassword('administrator', 'administrator');
        self::assertNotNull($user);
        self::assertSame(1000, $user->getId());

        $hash = $this->getEntityManager()->getConnection()->executeQuery('SELECT password FROM `user` WHERE id = 1000')->fetchOne();
        self::assertStringStartsWith('$', $hash, 'password should have been re-hashed automatically');
        self::assertNotSame(md5('administrator'), $hash, 'password should have been re-hashed automatically');
    }

    public function testGetOneByLogin(): void
    {
        self::assertNull($this->repository->getOneById(1), 'wrong user');

        $user = $this->repository->getOneById(1000);
        self::assertNotNull($user);
        self::assertSame(1000, $user->getId());
    }

    public function testGetAllAdministratorsToNotify(): void
    {
        $actual = $this->repository->getAllAdministratorsToNotify();
        self::assertCount(1, $actual);
    }

    public function testGetAllToQueueBalanceMessage(): void
    {
        $actual = $this->repository->getAllToQueueBalanceMessage();
        self::assertCount(2, $actual);

        $actualBookings = [];
        foreach ($actual[0]->getBookings() as $booking) {
            $actualBookings[] = $booking->getId();
        }

        $expected = [4004, 4005, 4015];
        self::assertSame($expected, $actualBookings, 'must have pre-loaded only the bookings that we are interested in');
    }

    public function testGetAllToQueueBalanceMessageNegative(): void
    {
        $actual = $this->repository->getAllToQueueBalanceMessage(true);
        self::assertCount(0, $actual);
    }

    /**
     * @dataProvider providerGetOneByLoginOrEmail
     */
    public function testGetOneByLoginOrEmail(?string $loginOrEmail, ?int $expected): void
    {
        $actual = $this->repository->getOneByLoginOrEmail($loginOrEmail);
        self::assertSame($expected, $actual ? $actual->getId() : $actual);
    }

    public function providerGetOneByLoginOrEmail(): iterable
    {
        yield [null, null];
        yield ['', null];
        yield ['non-existing', null];
        yield ['member', 1002];
        yield ['member@example.com', 1002];
        yield ['son', 1008];
    }

    public function testRecordLogin(): void
    {
        $this->setCurrentUser('administrator');

        /** @var User $user */
        $user = $this->getEntityManager()->getReference(User::class, 1002);

        self::assertNull($user->getFirstLogin());
        self::assertNull($user->getLastLogin());
        $this->assertNoStamp($user);

        $user->recordLogin();
        _em()->flush();

        $firstLogin = $user->getFirstLogin();
        $lastLogin = $user->getLastLogin();
        self::assertNotNull($firstLogin);
        self::assertNotNull($lastLogin);
        $this->assertNoStamp($user);

        $user->recordLogin();
        _em()->flush();

        $firstLogin2 = $user->getFirstLogin();
        $lastLogin2 = $user->getLastLogin();
        self::assertSame($firstLogin, $firstLogin2);
        self::assertNotSame($lastLogin, $lastLogin2);
        self::assertNotNull($firstLogin2);
        self::assertNotNull($lastLogin2);
        $this->assertNoStamp($user);
    }

    private function assertNoStamp(User $user): void
    {
        $count = $this->getEntityManager()->getConnection()->fetchOne('SELECT COUNT(*) FROM user WHERE id = ' . $user->getId() . ' AND creation_date IS NULL AND creator_id IS NULL AND update_date IS NULL AND updater_id IS NULL');
        self::assertSame(1, $count);
    }
}
