<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\DBAL\Types\BookingStatusType;
use Application\Model\Bookable;
use Application\Model\Booking;
use Cake\Chronos\Chronos;
use PHPUnit\Framework\TestCase;

class BookableTest extends TestCase
{
    public function testCode(): void
    {
        $bookable = new Bookable();
        self::assertNull($bookable->getCode());

        $bookable->setCode('foo');
        self::assertSame('foo', $bookable->getCode());

        $bookable->setCode('');
        self::assertNull($bookable->getCode());

        $bookable->setCode('foo');
        self::assertSame('foo', $bookable->getCode());

        $bookable->setCode(null);
        self::assertNull($bookable->getCode());
    }

    public function testGetSharedBookings(): void
    {
        $bookable = new Bookable();
        self::assertSame([], $bookable->getSharedBookings());

        $booking1 = new Booking();
        $booking1->setStatus(BookingStatusType::BOOKED);
        $booking1->setBookable($bookable);

        self::assertCount(1, $bookable->getSharedBookings());

        $bookable->setSimultaneousBookingMaximum(-1);
        self::assertSame([], $bookable->getSharedBookings(), 'empty list because we try to save SQL queries');

        $bookable->setSimultaneousBookingMaximum(0);
        self::assertCount(1, $bookable->getSharedBookings(), 'again normal list when there is a chance that simultaneous booking matter');

        $booking2 = new Booking();
        $booking2->setStatus(BookingStatusType::BOOKED);
        $booking2->setBookable($bookable);

        self::assertCount(2, $bookable->getSharedBookings(), 'second bookings should be returned');

        $booking1->setEndDate(Chronos::now());
        self::assertCount(1, $bookable->getSharedBookings(), 'terminated booking should be excluded');

        $booking2->setEndDate(Chronos::now());
        self::assertSame([], $bookable->getSharedBookings(), 'nothing shared anymore');
    }
}
