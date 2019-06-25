<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\User;
use Money\Money;
use PHPUnit\Framework\TestCase;
use Prophecy\Argument;

class BookingTest extends TestCase
{
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

        $prophecy1 = $this->prophesize(Bookable::class);
        $prophecy1->getSharedBookings()->willReturn([]);
        $prophecy1->getPeriodicPrice()->willReturn(Money::CHF(500));
        $prophecy1->bookingAdded(Argument::is($booking));

        $booking->setBookable($prophecy1->reveal());
        self::assertEquals(Money::CHF(500), $booking->getPeriodicPrice(), 'price should be exactly the bookable price');
    }

    public function testGetPeriodicPriceWithSharing(): void
    {
        $booking = new Booking();

        $prophecy1 = $this->prophesize(Bookable::class);
        $prophecy1->getSharedBookings()->willReturn([1, 2, 3]);
        $prophecy1->getPeriodicPrice()->willReturn(Money::CHF(500));
        $prophecy1->bookingAdded(Argument::is($booking));

        $booking->setBookable($prophecy1->reveal());
        self::assertEquals(Money::CHF(167), $booking->getPeriodicPrice(), 'price should be divided by the number of shared booking');
    }
}
