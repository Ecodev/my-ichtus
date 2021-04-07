<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\User;
use Money\Money;
use PHPUnit\Framework\TestCase;

class BookingTest extends TestCase
{
    protected function tearDown(): void
    {
        User::setCurrent(null);
    }

    public function testOwnerRelation(): void
    {
        $booking = new Booking();
        self::assertNull($booking->getOwner(), 'booking should have no owner');

        $user = new User();
        self::assertCount(0, $user->getBookings(), 'user should have no bookings');

        $booking->setOwner($user);
        self::assertCount(1, $user->getBookings(), 'user should have the added booking');
        self::assertSame($booking, $user->getBookings()->first(), 'user should have the same booking');
        self::assertSame($user, $booking->getOwner(), 'booking should have owner');
    }

    public function testBookableRelation(): void
    {
        $booking = new Booking();

        $bookable = new Bookable();
        self::assertCount(0, $bookable->getBookings(), 'bookable should have no bookings');

        $booking->setBookable($bookable);
        self::assertCount(1, $bookable->getBookings(), 'bookable should have the added booking');
        self::assertSame($booking, $bookable->getBookings()->first(), 'bookable should have the same booking');
        self::assertSame($bookable, $booking->getBookable(), 'booking should be able to retrieve added bookable');

        $booking->setBookable($bookable);
        self::assertCount(1, $bookable->getBookings(), 'bookable should still have exactly 1 booking');
        self::assertSame($booking, $bookable->getBookings()->first(), 'bookable should have the same booking');
        self::assertSame($bookable, $booking->getBookable(), 'booking should still have the same unique bookable');

        $bookable2 = new Bookable();
        $booking->setBookable($bookable2);
        self::assertCount(0, $bookable->getBookings(), 'bookable should not have any booking anymore');
        self::assertCount(1, $bookable2->getBookings(), 'bookable2 should have a new booking');
        self::assertSame($bookable2, $booking->getBookable(), 'booking should have only the second bookable left');
    }

    public function testGetPeriodicPriceWithoutSharing(): void
    {
        $booking = new Booking();

        $bookable = $this->createMock(Bookable::class);
        $bookable->expects(self::any())
            ->method('getSharedBookings')
            ->willReturn([]);

        $bookable->expects(self::any())
            ->method('getPeriodicPrice')
            ->willReturn(Money::CHF(500));

        $booking->setBookable($bookable);
        self::assertEquals(Money::CHF(500), $booking->getPeriodicPrice(), 'price should be exactly the bookable price');
    }

    public function testGetPeriodicPriceWithSharing(): void
    {
        $booking = new Booking();

        $bookable = $this->createMock(Bookable::class);
        $bookable->expects(self::any())
            ->method('getPeriodicPriceDividerBookings')
            ->willReturn([1, 2, 3]);

        $bookable->expects(self::any())
            ->method('getPeriodicPrice')
            ->willReturn(Money::CHF(500));

        $booking->setBookable($bookable);
        self::assertEquals(Money::CHF(167), $booking->getPeriodicPrice(), 'price should be divided by the number of shared booking');
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
            'can change nothing to nothing' => [null, null, null],
            'can set owner for first time' => [null, null, $u3],
            'can set owner for first time to myself' => [$u1, null, $u1],
            'can set owner for first time even if it is not myself' => [$u1, null, $u3],
            'can donate my stuff' => [$u1, $u1, $u3],
            'as a member I cannot donate stuff that are not mine' => [$u1, $u2, $u3, 'u1 is not allowed to change owner to u3 because it belongs to u2'],
            'as an admin I can donate stuff that are not mine' => [$admin, $u2, $u3],
        ];
    }
}
