<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Enum\BookingType;
use Application\Model\AbstractModel;
use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\User;
use Money\Money;
use PHPUnit\Framework\Attributes\DataProvider;
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

        $bookable = self::createStub(Bookable::class);
        $bookable->method('getSimultaneousBookings')->willReturn([]);
        $bookable->method('getPeriodicPrice')->willReturn(Money::CHF(500));

        $booking->setBookable($bookable);
        self::assertEquals(Money::CHF(500), $booking->getPeriodicPrice(), 'price should be exactly the bookable price');
    }

    public function testGetPeriodicPriceWithSharing(): void
    {
        $booking = new Booking();

        $bookable = self::createStub(Bookable::class);
        $bookable->method('getPeriodicPriceDividerBookings')->willReturn([1, 2, 3]);
        $bookable->method('getPeriodicPrice')->willReturn(Money::CHF(500));

        $booking->setBookable($bookable);
        self::assertEquals(Money::CHF(167), $booking->getPeriodicPrice(), 'price should be divided by the number of shared booking');
    }

    #[DataProvider('providerSetOwner')]
    public function testSetOwner(AbstractModel $subject, ?User $currentUser, ?User $originalOwner, ?User $newOwner, ?string $exception = null): void
    {
        User::setCurrent($currentUser);

        self::assertNull($subject->getOwner());

        $subject->setOwner($originalOwner);
        self::assertSame($originalOwner, $subject->getOwner());

        if ($exception) {
            $this->expectExceptionMessage($exception);
        }

        $subject->setOwner($newOwner);
        self::assertSame($newOwner, $subject->getOwner());
    }

    public static function providerSetOwner(): iterable
    {
        $u1 = new User();
        $u1->setLogin('u1');
        $u2 = new User();
        $u2->setLogin('u2');
        $u3 = new User();
        $u3->setLogin('u3');
        $admin = new User(User::ROLE_ADMINISTRATOR);
        $admin->setLogin('admin');
        $responsible = new User(User::ROLE_RESPONSIBLE);
        $responsible->setLogin('responsible');

        yield 'can change nothing to nothing' => [self::genericClass(Booking::class), null, null, null];
        yield 'can set owner for first time' => [self::genericClass(Booking::class), null, null, $u3];
        yield 'can set owner for first time to myself' => [self::genericClass(Booking::class), $u1, null, $u1];
        yield 'can set owner for first time even if it is not myself' => [self::genericClass(Booking::class), $u1, null, $u3];
        yield 'can donate my stuff' => [self::genericClass(Booking::class), $u1, $u1, $u3];
        yield 'as a member I cannot donate stuff that are not mine' => [self::genericClass(Booking::class), $u1, $u2, $u3, 'u1 is not allowed to change owner to u3 because it belongs to u2'];
        yield 'as an admin I can donate stuff that are not mine' => [self::genericClass(Booking::class), $admin, $u2, $u3];
        yield 'as a responsible I cannot donate most of the stuff (account)' => [self::genericClass(Account::class), $responsible, $u2, $u3, 'responsible is not allowed to change owner to u3 because it belongs to u2'];
        yield 'as a responsible I cannot donate most of the stuff (user)' => [self::genericClass(User::class), $responsible, $u2, $u3, 'responsible is not allowed to change owner to u3 because it belongs to u2'];
        yield 'as a responsible I can donate bookable' => [self::genericClass(Bookable::class), $responsible, $u2, $u3];
        yield 'as a member I cannot donate bookable that is not mine' => [self::genericClass(Bookable::class), $u1, $u2, $u3, 'u1 is not allowed to change owner to u3 because it belongs to u2'];
        yield 'as a responsible I cannot donate generic booking that is not mine' => [self::genericClass(Booking::class), $responsible, $u2, $u3, 'responsible is not allowed to change owner to u3 because it belongs to u2'];
        yield 'as a responsible I can donate admin approved booking that is not mine' => [self::adminApprovedBooking(), $responsible, $u2, $u3];
    }

    private static function genericClass(string $class): AbstractModel
    {
        $instance = new $class();
        assert($instance instanceof AbstractModel);

        return $instance;
    }

    private static function adminApprovedBooking(): Booking
    {
        $adminApprovedBookable = new Bookable();
        $adminApprovedBookable->setBookingType(BookingType::AdminApproved);
        $adminApprovedBooking = new Booking();
        $adminApprovedBooking->setBookable($adminApprovedBookable);

        return $adminApprovedBooking;
    }
}
