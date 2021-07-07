<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\DBAL\Types\BookingTypeType;
use Application\Model\Bookable;
use Application\Model\BookableTag;
use Application\Model\Booking;
use Application\Repository\BookableTagRepository;
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
        $booking1->setBookable($bookable);

        self::assertSame([], $bookable->getSharedBookings());

        $bookable->setBookingType(BookingTypeType::SELF_APPROVED);
        self::assertSame([], $bookable->getSharedBookings(), 'self_approved show 0 booking');

        $bookable->setBookingType(BookingTypeType::MANDATORY);
        self::assertSame([], $bookable->getSharedBookings(), 'mandatory show 0 booking');

        $bookable->setBookingType(BookingTypeType::ADMIN_ASSIGNED);
        self::assertCount(1, $bookable->getSharedBookings(), 'admin_assigned show 1 booking');

        $bookable->setBookingType(BookingTypeType::APPLICATION);
        self::assertCount(1, $bookable->getSharedBookings(), 'application show 1 booking');

        $booking2 = new Booking();
        $booking2->setBookable($bookable);

        self::assertCount(2, $bookable->getSharedBookings(), 'second bookings should be returned');

        $booking1->setEndDate(Chronos::now());
        self::assertCount(1, $bookable->getSharedBookings(), 'terminated booking should be excluded');

        $booking2->setEndDate(Chronos::now());
        self::assertSame([], $bookable->getSharedBookings(), 'nothing shared anymore');
    }
}
