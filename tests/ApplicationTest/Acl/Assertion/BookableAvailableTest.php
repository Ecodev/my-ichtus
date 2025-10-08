<?php

declare(strict_types=1);

namespace ApplicationTest\Acl\Assertion;

use Application\Acl\Acl;
use Application\Acl\Assertion\BookableAvailable;
use Application\Enum\BookableStatus;
use Application\Enum\BookingStatus;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\License;
use Application\Model\User;
use Ecodev\Felix\Acl\ModelResource;
use PHPUnit\Framework\TestCase;

class BookableAvailableTest extends TestCase
{
    protected function tearDown(): void
    {
        User::setCurrent(null);
    }

    /**
     * @dataProvider providerAssert
     */
    public function testAssert(
        ?string $expectedMessage,
        ?string $withUserRole,
        bool $withBooking,
        bool $withBookable = false,
        bool $bookableIsActive = false,
        bool $bookableRequiresLicense = false,
        bool $useHasLicense = false,
        BookingStatus $bookingStatus = BookingStatus::Application,
        int $confirmedBookings = 0,
        int $applicationBookings = 0,
        int $simultaneousBookingMaximum = 1,
        int $waitingListLength = 0,
    ): void {
        $user = $this->getMockBuilder(User::class)->onlyMethods(['getRole'])->getMock();

        $booking = null;
        if ($withBooking) {
            $booking = new Booking();
            $booking->setStatus($bookingStatus);

            if ($withBookable) {
                $bookable = new Bookable();
                $booking->setBookable($bookable);
                $bookable->setStatus($bookableIsActive ? BookableStatus::Active : BookableStatus::Inactive);
                $bookable->setSimultaneousBookingMaximum($simultaneousBookingMaximum);
                $bookable->setWaitingListLength($waitingListLength);

                if ($bookableRequiresLicense) {
                    $license = new License();
                    $license->setName('my license');
                    $license->addBookable($bookable);

                    if ($useHasLicense) {
                        $license->addUser($user);
                    }
                }

                $this->addBookings($bookable, $confirmedBookings, BookingStatus::Booked);
                $this->addBookings($bookable, $applicationBookings, BookingStatus::Application);
            }
        }

        $acl = $this->createMock(Acl::class);
        $acl->expects(self::exactly($expectedMessage ? 1 : 0))
            ->method('reject')
            ->with($expectedMessage)
            ->willReturn(false);

        $resource = new ModelResource(Booking::class, $booking);
        if ($withUserRole) {
            $user->method('getRole')
                ->willReturn($withUserRole);

            User::setCurrent($user);
        }

        $assert = new BookableAvailable();
        self::assertSame(!$expectedMessage, $assert->assert($acl, null, $resource));
    }

    public static function providerAssert(): iterable
    {
        yield 'rejects anonymous' => ['the user is not logged in', null, false];
        yield 'rejects anonymous even with a booking' => ['the user is not logged in', null, true];
        yield 'rejects absence of booking, because that would be a critical bug in our architecture' => ['the booking does not exist', User::ROLE_MEMBER, false];
        yield 'allows booking without bookable' => [null, User::ROLE_MEMBER, true];
        yield 'rejects inactive bookable' => ['the bookable is not active', User::ROLE_MEMBER, true, true];
        yield 'rejects bookable requiring license' => ['the user does not have the required license: my license', User::ROLE_MEMBER, true, true, true, true];
        yield 'allows bookable requiring license if booking_only' => [null, User::ROLE_BOOKING_ONLY, true, true, true, true];
        yield 'allows bookable requiring license if have license' => [null, User::ROLE_MEMBER, true, true, true, true, true];
        yield 'rejects bookable who reached its limit' => ['the limit of simultaneous bookings was reached: 0/0', User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, 0, 0, 0];
        yield 'allows bookable with infinite limit' => [null, User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, -1];
        yield 'rejects application if 3 confirmed and limit to 3' => ['the limit of simultaneous bookings was reached: 3/3', User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, 3, 0, 3];
        yield 'rejects booked if 3 confirmed and limit to 3' => ['the limit of simultaneous bookings was reached: 3/3', User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Booked, 3, 0, 3];
        yield 'rejects application if 2 confirmed, 1 application and limit to 3' => ['the limit of simultaneous bookings was reached: 3/3', User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, 2, 1, 3];
        yield 'allows application if 2 confirmed, 1 application and limit to 3 and 5' => [null, User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, 2, 1, 3, 5];
        yield 'allows application if 3 confirmed, 1 application and limit to 3 and 5' => [null, User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, 3, 1, 3, 5];
        yield 'rejects booked if 3 confirmed, 1 application and limit to 3 and 5, because it would be stealing a spot in the waiting list, instead we must pass via an application' => ['the limit of simultaneous bookings was reached: 3/3 and the waiting list is full: 1/5', User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Booked, 3, 1, 3, 5];
        yield 'rejects application if 3 confirmed, 5 application and limit to 3 and 5' => ['the limit of simultaneous bookings was reached: 3/3 and the waiting list is full: 5/5', User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, 3, 5, 3, 5];
        yield 'rejects application if 1 confirmed, 7 application and limit to 3 and 5' => ['the limit of simultaneous bookings was reached: 3/3 and the waiting list is full: 5/5', User::ROLE_MEMBER, true, true, true, false, false, BookingStatus::Application, 1, 7, 3, 5];
    }

    private function addBookings(Bookable $bookable, int $count, BookingStatus $bookingStatus): void
    {
        for ($i = 0; $i < $count; ++$i) {
            $booking = new Booking();
            $booking->setStatus($bookingStatus);
            $booking->setBookable($bookable);
        }
    }
}
