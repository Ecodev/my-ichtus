<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Model\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function tearDown(): void
    {
        User::setCurrent(null);
    }

    public function testGetGlobalPermissions(): void
    {
        $user = new User();
        $actual = $user->getGlobalPermissions();
        $expected = [
            'country' => [
                'create' => false,
            ],
            'tag' => [
                'create' => true,
            ],
            'user' => [
                'create' => false,
            ],
        ];

        self::assertEquals($expected, $actual);

        $expectedForAdmin = [
            'country' => [
                'create' => true,
            ],
            'tag' => [
                'create' => true,
            ],
            'user' => [
                'create' => true,
            ],
        ];

        User::setCurrent($user);
        self::assertSame($user, User::getCurrent());

        $admin = new User(User::ROLE_ADMINISTRATOR);
        $actualForAdmin = $admin->getGlobalPermissions();

        self::assertEquals($expectedForAdmin, $actualForAdmin);
        self::assertSame($user, User::getCurrent());
        self::assertNotEquals($expectedForAdmin, $expected);
    }

    /**
     * @dataProvider providerSetRole
     *
     * @param string $currentRole
     * @param string $oldRole
     * @param string $newRole
     * @param null|string $exception
     */
    public function testSetRole(string $currentRole, string $oldRole, string $newRole, ?string $exception): void
    {
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
            [User::ROLE_ANONYMOUS, User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, 'anonymous is not allowed to change role to member'],
            [User::ROLE_ANONYMOUS, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, 'anonymous is not allowed to change role to administrator'],

            [User::ROLE_MEMBER, User::ROLE_MEMBER, User::ROLE_MEMBER, null],
            [User::ROLE_MEMBER, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, 'member is not allowed to change role to administrator'],

            [User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, User::ROLE_ADMINISTRATOR, null],
            [User::ROLE_ADMINISTRATOR, User::ROLE_ADMINISTRATOR, User::ROLE_MEMBER, null],
        ];
    }

    public function testSetPassword(): void
    {
        $user = new User();
        self::assertSame('', $user->getPassword(), 'should have no password at first');

        $user->setPassword('12345');
        $actual1 = $user->getPassword();
        self::assertNotSame('', $actual1, 'should be able to change password ');
        self::assertTrue(password_verify('12345', $actual1), 'password must have been hashed');

        $user->setPassword('');
        $actual2 = $user->getPassword();
        self::assertSame($actual1, $actual2, 'should ignore empty password');

        $user->setPassword('money');
        $actual3 = $user->getPassword();
        self::assertNotSame($actual1, $actual3, 'should be able to change to something else');
        self::assertTrue(password_verify('money', $actual3), 'password must have been hashed again');
    }
}
