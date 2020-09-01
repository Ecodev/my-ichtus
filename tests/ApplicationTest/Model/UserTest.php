<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\DBAL\Types\BookingStatusType;
use Application\Model\Account;
use Application\Model\Booking;
use Application\Model\User;
use Cake\Chronos\Chronos;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    protected function tearDown(): void
    {
        User::setCurrent(null);
    }

    /**
     * @dataProvider providerSetRole
     */
    public function testSetRole(string $currentRole, string $oldRole, string $newRole, ?string $exception): void
    {
        User::setCurrent(null);
        if ($currentRole !== User::ROLE_ANONYMOUS) {
            $currentUser = new User($currentRole);
            User::setCurrent($currentUser);
        }

        $user2 = new User($oldRole);

        if ($exception) {
            $this->expectExceptionMessage($exception);
        }

        $user2->setRole($newRole);
        self::assertSame($newRole, $user2->getRole());
    }

    public function providerSetRole(): array
    {
        return [
            [User::ROLE_ANONYMOUS, User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, 'anonymous is not allowed to change role from administrator to member'],
            [User::ROLE_ANONYMOUS, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, 'anonymous is not allowed to change role from member to administrator'],

            [User::ROLE_MEMBER, User::ROLE_MEMBER, User::ROLE_MEMBER, null],
            [User::ROLE_MEMBER, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, 'member is not allowed to change role from member to administrator'],

            [User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, null],
            [User::ROLE_ADMINISTRATOR, User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, null],
        ];
    }

    /**
     * @dataProvider providerSetOwner
     */
    public function testSetOwner(?User $currentUser, ?User $originalOwner, ?User $newOwner, ?string $exception = null): void
    {
        User::setCurrent($currentUser);

        $subject = new Booking();
        self::assertNull($subject->getOwner());

        $subject->setOwner($originalOwner);
        self::assertSame($originalOwner, $subject->getOwner());

        if ($exception) {
            $this->expectExceptionMessage($exception);
        }

        $subject->setOwner($newOwner);
        self::assertSame($newOwner, $subject->getOwner());
    }

    public function providerSetOwner(): array
    {
        $u1 = new User();
        $u1->setLogin('u1');
        $u2 = new User();
        $u2->setLogin('u2');
        $u3 = new User();
        $u3->setLogin('u3');
        $admin = new User(User::ROLE_ADMINISTRATOR);
        $admin->setLogin('admin');

        return [
            'can change nothing' => [null, null, null],
            'can set owner for first time' => [null, null, $u3],
            'can set owner for first time to myself' => [$u1, null, $u1],
            'can set owner for first time even if it is not myself' => [$u1, null, $u3],
            'can donate my stuff' => [$u1, $u1, $u3],
            'cannot donate stuff that are not mine' => [$u1, $u2, $u3, 'u1 is not allowed to change owner to u3 because it belongs to u2'],
            'admin cannot donate stuff that are not mine' => [$admin, $u2, $u3],
        ];
    }

    public function providerCanOpenDoor(): array
    {
        return [
            'anonymous cannot open' => [
                User::ROLE_ANONYMOUS,
                User::STATUS_ACTIVE,
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
                ['door1' => false, 'door2' => false, 'door3' => false, 'door4' => false],
            ],
            'individual member can open' => [
                User::ROLE_INDIVIDUAL,
                User::STATUS_ACTIVE,
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
            ],
            'active member can open' => [
                User::ROLE_MEMBER,
                User::STATUS_ACTIVE,
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
            ],
            'inactive member cannot open' => [
                User::ROLE_MEMBER,
                User::STATUS_INACTIVE,
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
                ['door1' => false, 'door2' => false, 'door3' => false, 'door4' => false],
            ],
            'responsible can open' => [
                User::ROLE_RESPONSIBLE,
                User::STATUS_ACTIVE,
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
            ],
            'administrator can open' => [
                User::ROLE_ADMINISTRATOR,
                User::STATUS_ACTIVE,
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
                ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
            ],
        ];
    }

    /**
     * @dataProvider providerCanOpenDoor,
     */
    public function testCanOpenDoor(string $role, string $status, array $doors, array $result): void
    {
        $user = new User($role);
        $user->setStatus($status);
        foreach ($doors as $door => $value) {
            $setter = 'set' . ucfirst($door);
            $user->$setter($value);
        }

        foreach ($result as $door => $canOpen) {
            self::assertSame($canOpen, $user->getCanOpenDoor($door));
        }
    }

    public function testGetAccount(): void
    {
        $user1 = new User();
        $user2 = new User();

        self::assertNull($user1->getAccount());
        self::assertNull($user2->getAccount());

        $account1 = new Account();
        $account2 = new Account();
        $account1->setOwner($user1);
        $account2->setOwner($user2);

        self::assertSame($account1, $user1->getAccount());
        self::assertSame($account2, $user2->getAccount());

        $user2->setOwner($user1);

        self::assertSame($account1, $user1->getAccount());
        self::assertSame($account1, $user2->getAccount(), 'user2 should now use user1 account');

        User::setCurrent($user1);
        $user2->setOwner($user2);

        self::assertSame($account1, $user1->getAccount());
        self::assertSame($account2, $user2->getAccount(), 'user2 should be use his own account again');

        User::setCurrent($user2);
        $user2->setOwner(null);

        self::assertSame($account1, $user1->getAccount());
        self::assertSame($account2, $user2->getAccount(), 'user2 should be use his own account again');
    }

    public function testGetRunningBookings(): void
    {
        $user = new User();

        $unapproved = new Booking();
        $unapproved->setOwner($user);
        $unapproved->setStatus(BookingStatusType::APPLICATION);

        $completed = new Booking();
        $completed->setOwner($user);
        $completed->setStatus(BookingStatusType::BOOKED);
        $completed->setEndDate(Chronos::yesterday());

        $running = new Booking();
        $running->setOwner($user);
        $running->setStatus(BookingStatusType::BOOKED);

        $runnings = $user->getRunningBookings();

        self::assertCount(1, $runnings);
    }
}
