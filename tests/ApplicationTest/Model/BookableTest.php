<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
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

    public function testGetSimultaneousBookings(): void
    {
        $bookable = new Bookable();
        self::assertCount(0, $bookable->getSimultaneousBookings());
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $booking1 = new Booking();
        $booking1->setStatus(BookingStatus::Booked);
        $booking1->setBookable($bookable);

        self::assertCount(1, $bookable->getSimultaneousBookings());
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $bookable->setBookingType(BookingType::SelfApproved);
        self::assertCount(0, $bookable->getSimultaneousBookings(), 'empty list because we try to save SQL queries');
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $bookable->setBookingType(BookingType::Mandatory);
        self::assertCount(0, $bookable->getSimultaneousBookings(), 'empty list because we try to save SQL queries');
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $bookable->setBookingType(BookingType::AdminApproved);
        self::assertCount(1, $bookable->getSimultaneousBookings(), 'again normal list when there is a chance that simultaneous booking matter');
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $bookable->setBookingType(BookingType::AdminAssigned);
        self::assertCount(1, $bookable->getSimultaneousBookings(), 'again normal list when there is a chance that simultaneous booking matter');
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $booking2 = new Booking();
        $booking2->setStatus(BookingStatus::Booked);
        $booking2->setBookable($bookable);

        self::assertCount(2, $bookable->getSimultaneousBookings(), 'second bookings should be returned');
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $booking1->setEndDate(Chronos::now());
        self::assertCount(1, $bookable->getSimultaneousBookings(), 'terminated booking should be excluded');
        self::assertCount(0, $bookable->getSimultaneousApplications());

        $booking2->setStatus(BookingStatus::Application);
        self::assertCount(0, $bookable->getSimultaneousBookings(), 'nothing shared anymore because applications are excluded');
        self::assertCount(1, $bookable->getSimultaneousApplications());
    }

    public function testGetSimultaneousApplications(): void
    {
        $bookable = new Bookable();
        self::assertCount(0, $bookable->getSimultaneousApplications());
        self::assertCount(0, $bookable->getSimultaneousBookings());

        $booking1 = new Booking();
        $booking1->setBookable($bookable);

        self::assertCount(1, $bookable->getSimultaneousApplications());
        self::assertCount(0, $bookable->getSimultaneousBookings());

        $bookable->setBookingType(BookingType::SelfApproved);
        self::assertCount(0, $bookable->getSimultaneousApplications(), 'empty list because we try to save SQL queries');
        self::assertCount(0, $bookable->getSimultaneousBookings());

        $bookable->setBookingType(BookingType::AdminApproved);
        self::assertCount(1, $bookable->getSimultaneousApplications(), 'again normal list when there is a chance that simultaneous booking matter');
        self::assertCount(0, $bookable->getSimultaneousBookings());

        $booking2 = new Booking();
        $booking2->setBookable($bookable);

        self::assertCount(2, $bookable->getSimultaneousApplications(), 'second bookings should be returned');
        self::assertCount(0, $bookable->getSimultaneousBookings());

        $booking1->setEndDate(Chronos::now());
        self::assertCount(1, $bookable->getSimultaneousApplications(), 'terminated booking should be excluded');
        self::assertCount(0, $bookable->getSimultaneousBookings());

        $booking2->setStatus(BookingStatus::Processed);
        self::assertCount(0, $bookable->getSimultaneousApplications(), 'nothing shared anymore because non-applications are excluded');
        self::assertCount(1, $bookable->getSimultaneousBookings());

        $booking2->setStatus(BookingStatus::Booked);
        self::assertCount(0, $bookable->getSimultaneousApplications(), 'nothing shared anymore because non-applications are excluded');
        self::assertCount(1, $bookable->getSimultaneousBookings());
    }
}
