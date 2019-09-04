<?php

declare(strict_types=1);

namespace ApplicationTest\Acl;

use Application\Acl\Acl;
use Application\Model\User;
use PHPUnit\Framework\TestCase;

class AclTest extends TestCase
{
    public function testIsCurrentUserAllowed(): void
    {
        $acl = new Acl();
        $user = new User();

        $owner = new User();
        $owner->setLogin('sarah');
        User::setCurrent($owner);
        $user->timestampCreation();

        User::setCurrent(null);
        self::assertFalse($acl->isCurrentUserAllowed($user, 'update'), 'anonymous cannot update');
        self::assertSame('Non-logged user with role anonymous is not allowed on resource "User#" with privilege "update"', $acl->getLastDenialMessage());

        User::setCurrent($owner);
        self::assertFalse($acl->isCurrentUserAllowed($user, 'update'), 'student cannot update even if owner');
        self::assertSame('User "sarah" with role individual is not allowed on resource "User#" with privilege "update" because it is not himself', $acl->getLastDenialMessage());

        $other = new User();
        $other->setLogin('john');
        User::setCurrent($other);
        self::assertFalse($acl->isCurrentUserAllowed($user, 'update'), 'other user cannot update');
        self::assertSame('User "john" with role individual is not allowed on resource "User#" with privilege "update" because it is not himself', $acl->getLastDenialMessage());

        // Test again the first case to assert that reject reason does not leak from one assertion to the next
        User::setCurrent(null);
        self::assertFalse($acl->isCurrentUserAllowed($user, 'update'), 'anonymous cannot update');
        self::assertSame('Non-logged user with role anonymous is not allowed on resource "User#" with privilege "update"', $acl->getLastDenialMessage());

        $administrator = new User(User::ROLE_ADMINISTRATOR);
        $administrator->setLogin('jane');
        User::setCurrent($administrator);
        self::assertTrue($acl->isCurrentUserAllowed($user, 'update'), 'admin can do anything');
        self::assertNull($acl->getLastDenialMessage());
    }
}
