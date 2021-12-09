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
}
