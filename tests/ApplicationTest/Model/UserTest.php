<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Enum\BookingStatus;
use Application\Enum\UserStatus;
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

    public function providerSetRole(): iterable
    {
        yield [User::ROLE_ANONYMOUS, User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, 'anonymous is not allowed to change role from administrator to member'];
        yield [User::ROLE_ANONYMOUS, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, 'anonymous is not allowed to change role from member to administrator'];
        yield [User::ROLE_MEMBER, User::ROLE_MEMBER, User::ROLE_MEMBER, null];
        yield [User::ROLE_MEMBER, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, 'member is not allowed to change role from member to administrator'];
        yield [User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, null];
        yield [User::ROLE_ADMINISTRATOR, User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, null];
    }

    public function testCannotOwnMyself(): void
    {
        $user = new User();
        $this->expectExceptionMessage('This user cannot be owned by himself');
        $user->setOwner($user);
    }

    public function testCannotBeOwnedByAnotherOwned(): void
    {
        $user = new User();
        $owner1 = new User();
        $owner2 = new User();
        $owner1->setOwner($owner2);
        self::assertSame($owner2, $owner1->getOwner());

        $this->expectExceptionMessage('This user cannot be owned by a user who is himself owned by somebody else');
        $user->setOwner($owner1);
    }

    public function testCannotBeOwnedBecauseIsOwner(): void
    {
        $user = new User();
        $owned = new User();
        $owned->setOwner($user);
        self::assertSame($user, $owned->getOwner());

        $owner = new User();

        $this->expectExceptionMessage('This user owns other users, so he cannot himself be owned by somebody else');
        $user->setOwner($owner);
    }

    public function providerCanOpenDoor(): iterable
    {
        yield 'anonymous cannot open' => [
            User::ROLE_ANONYMOUS,
            UserStatus::Active,
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
            ['door1' => false, 'door2' => false, 'door3' => false, 'door4' => false],
        ];
        yield 'individual member can open' => [
            User::ROLE_INDIVIDUAL,
            UserStatus::Active,
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
        ];
        yield 'active member can open' => [
            User::ROLE_MEMBER,
            UserStatus::Active,
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
        ];
        yield 'inactive member cannot open' => [
            User::ROLE_MEMBER,
            UserStatus::Inactive,
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => false],
            ['door1' => false, 'door2' => false, 'door3' => false, 'door4' => false],
        ];
        yield 'responsible can open' => [
            User::ROLE_RESPONSIBLE,
            UserStatus::Active,
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
        ];
        yield 'administrator can open' => [
            User::ROLE_ADMINISTRATOR,
            UserStatus::Active,
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
            ['door1' => true, 'door2' => true, 'door3' => true, 'door4' => true],
        ];
    }

    /**
     * @dataProvider providerCanOpenDoor,
     */
    public function testCanOpenDoor(string $role, UserStatus $status, array $doors, array $result): void
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
        $user2->setOwner(null);

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
        $unapproved->setStatus(BookingStatus::Application);

        $completed = new Booking();
        $completed->setOwner($user);
        $completed->setStatus(BookingStatus::Booked);
        $completed->setEndDate(Chronos::yesterday());

        $running = new Booking();
        $running->setOwner($user);
        $running->setStatus(BookingStatus::Booked);

        $runnings = $user->getRunningBookings();

        self::assertCount(1, $runnings);
    }

    public function testSetStatus(): void
    {
        $u1 = new User();
        $u2 = new User();

        // Initial status
        self::assertSame(UserStatus::New, $u1->getStatus());
        self::assertSame(UserStatus::New, $u2->getStatus());

        $u2->setOwner($u1);
        $u1->setStatus(UserStatus::Inactive);

        // Status is propagated to existing users
        self::assertSame(UserStatus::Inactive, $u1->getStatus());
        self::assertSame(UserStatus::Inactive, $u2->getStatus());

        $u1->setStatus(UserStatus::Active);
        self::assertSame(UserStatus::Active, $u1->getStatus());
        self::assertSame(UserStatus::Active, $u2->getStatus());

        // Status is propagated on new users too
        $u3 = new User();
        self::assertSame(UserStatus::New, $u3->getStatus());
        $u3->setOwner($u1);
        self::assertSame(UserStatus::Active, $u3->getStatus());

        // Status 'archived' sets resign date
        Chronos::setTestNow((new Chronos()));
        $u1->setStatus(UserStatus::Archived);
        self::assertTrue($u1->getResignDate() && $u1->getResignDate()->isToday());
    }
}
