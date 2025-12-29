<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Service\Invoicer;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Money\Money;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class InvoicerTest extends TestCase
{
    use TestWithTransactionAndUser;

    public function testInvoice(): void
    {
        global $container;

        /** @var Invoicer $invoicer */
        $invoicer = $container->get(Invoicer::class);
        $actual = $invoicer->invoicePeriodic();
        self::assertSame(3, $actual);

        $this->getEntityManager()->flush();

        $actual2 = $invoicer->invoicePeriodic();
        self::assertSame(0, $actual2, 'should not invoice things that are already invoiced');
    }

    #[DataProvider('providerInvoiceInitial')]
    public function testInvoiceInitial(Money $initialPrice, Money $periodicPrice, array $expected): void
    {
        $user = new User();
        $user->setFirstName('John');
        $user->setLastName('Doe');

        $bookable = new Bookable();
        $bookable->setName('My bookable');
        $bookable->setInitialPrice($initialPrice);
        $bookable->setPeriodicPrice($periodicPrice);

        $bookableAccount = new Account();
        $bookableAccount->setName('Bookable account');
        $bookable->setCreditAccount($bookableAccount);

        // Creation of booking will implicitly call the invoicer
        $booking = new Booking();
        $booking->setOwner($user);
        $booking->setBookable($bookable);
        $booking->setStatus(BookingStatus::Booked);

        $account = $user->getAccount();

        if ($expected === []) {
            self::assertNull($account);
        } else {
            $all = array_merge(
                $account->getCreditTransactionLines()->toArray(),
                $account->getDebitTransactionLines()->toArray(),
            );
            $actual = [];

            $transaction = null;
            /** @var TransactionLine $t */
            foreach ($all as $t) {
                if (!$transaction) {
                    $transaction = $t->getTransaction();
                } else {
                    self::assertSame($transaction, $t->getTransaction(), 'all lines should belong to same transaction');
                }

                $actual[] = [
                    $t->getName(),
                    $t->getBookable()->getName(),
                    $t->getDebit()->getName(),
                    $t->getCredit()->getName(),
                    $t->getBalance()->getAmount(),
                ];
            }

            self::assertSame($expected, $actual);
        }
    }

    public static function providerInvoiceInitial(): iterable
    {
        yield 'free booking should create nothing' => [
            Money::CHF(0),
            Money::CHF(0),
            [],
        ];
        yield 'only initial' => [
            Money::CHF(1025),
            Money::CHF(0),
            [
                [
                    'Prestation ponctuelle',
                    'My bookable',
                    'John Doe',
                    'Bookable account',
                    '1025',
                ],
            ],
        ];
        yield 'only periodic' => [
            Money::CHF(0),
            Money::CHF(9025),
            [
                [
                    'Prestation annuelle',
                    'My bookable',
                    'John Doe',
                    'Bookable account',
                    '9025',
                ],
            ],
        ];
        yield 'both initial and periodic should create two lines' => [
            Money::CHF(1025),
            Money::CHF(9025),
            [
                [
                    'Prestation ponctuelle',
                    'My bookable',
                    'John Doe',
                    'Bookable account',
                    '1025',
                ],
                [
                    'Prestation annuelle',
                    'My bookable',
                    'John Doe',
                    'Bookable account',
                    '9025',
                ],
            ],
        ];
        yield 'negative balance should swap accounts' => [
            Money::CHF(-1025),
            Money::CHF(-9025),
            [
                [
                    'Prestation ponctuelle',
                    'My bookable',
                    'Bookable account',
                    'John Doe',
                    '1025',
                ],
                [
                    'Prestation annuelle',
                    'My bookable',
                    'Bookable account',
                    'John Doe',
                    '9025',
                ],
            ],
        ];
    }

    public function testInvoicerNotCalled(): void
    {
        $user = new User();
        $bookable = new Bookable();
        $bookable->setInitialPrice(Money::CHF(100));
        $bookable->setPeriodicPrice(Money::CHF(100));

        $bookingWithoutOwner = new Booking();
        $bookingWithoutOwner->setBookable($bookable);
        $bookingWithoutOwner->setStatus(BookingStatus::Booked);

        $bookingWithoutBookable = new Booking();
        $bookingWithoutBookable->setOwner($user);
        $bookingWithoutBookable->setStatus(BookingStatus::Booked);

        $bookingWithoutStatus = new Booking();
        $bookingWithoutStatus->setBookable($bookable);
        $bookingWithoutStatus->setOwner($user);

        self::assertNull($user->getAccount(), 'invoicer is only called when we have both an owner and a bookable');
    }

    #[DataProvider('providerShouldInvoiceInitial')]
    public function testShouldInvoiceInitial(array $data, int $expected): void
    {
        $user = new User();
        $bookable = $this->createMock(Bookable::class);
        $bookable->expects(self::any())
            ->method('getCreditAccount')
            ->willReturn($data['bookable']['creditAccount'] ? new Account() : null);

        $bookable->expects(self::any())
            ->method('getInitialPrice')
            ->willReturn($data['bookable']['initialPrice']);

        $bookable->expects(self::any())
            ->method('getPeriodicPrice')
            ->willReturn($data['bookable']['periodicPrice']);

        $bookable->expects(self::any())
            ->method('getBookingType')
            ->willReturn($data['bookable']['bookingType']);

        $booking = $this->createMock(Booking::class);
        $booking->expects(self::any())
            ->method('getId')
            ->willReturn($data['id']);

        $booking->expects(self::any())
            ->method('getStatus')
            ->willReturn($data['status']);

        $booking->expects(self::any())
            ->method('getPeriodicPrice')
            ->willReturn($data['bookable']['periodicPrice']);

        $booking->expects(self::any())
            ->method('getBookable')
            ->willReturn($bookable);

        global $container;

        /** @var Invoicer $invoicer */
        $invoicer = $container->get(Invoicer::class);
        $actual = $invoicer->invoiceInitial($user, $booking, $data['previousStatus']);

        self::assertSame($expected, $actual);
    }

    public static function providerShouldInvoiceInitial(): iterable
    {
        yield 'create MANDATORY booking should invoice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            1,
        ];
        yield 'update MANDATORY booking should not invoice' => [
            [
                'id' => 123,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            0,
        ];
        yield 'create MANDATORY booking that is processed should invoice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Processed,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            1,
        ];
        yield 'create MANDATORY booking that is application should not invoice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Application,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            0,
        ];
        yield 'create MANDATORY booking without creditAccount should not invoice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => false,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            0,
        ];
        yield 'create MANDATORY free booking should not invoice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(0),
                    'periodicPrice' => Money::CHF(0),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            0,
        ];
        yield 'create MANDATORY booking with free initialPrice and non-free periodicPrice should still actually invoice, because we also invoice periodicPrice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(0),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            1,
        ];
        yield 'create APPLICATION booking should not invoice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Application,
                ],
            ],
            0,
        ];
        yield 'update MANDATORY booking to change status from APPLICATION to BOOKED should invoice' => [
            [
                'id' => 123,
                'previousStatus' => BookingStatus::Application,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            1,
        ];
        yield 'update MANDATORY booking to change status from BOOKED to BOOKED should not invoice' => [
            [
                'id' => 123,
                'previousStatus' => BookingStatus::Booked,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            0,
        ];
        yield 'update MANDATORY booking to change status from PROCESSED to BOOKED should not invoice' => [
            [
                'id' => 123,
                'previousStatus' => BookingStatus::Processed,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::Mandatory,
                ],
            ],
            0,
        ];
        yield 'create ADMIN_APPROVED booking should invoice' => [
            [
                'id' => null,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::AdminApproved,
                ],
            ],
            1,
        ];
        yield 'update ADMIN_APPROVED booking should not invoice' => [
            [
                'id' => 123,
                'previousStatus' => null,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::AdminApproved,
                ],
            ],
            0,
        ];
        yield 'update ADMIN_APPROVED booking to change status from APPLICATION to BOOKED should invoice' => [
            [
                'id' => 123,
                'previousStatus' => BookingStatus::Application,
                'status' => BookingStatus::Booked,
                'bookable' => [
                    'creditAccount' => true,
                    'initialPrice' => Money::CHF(100),
                    'periodicPrice' => Money::CHF(100),
                    'bookingType' => BookingType::AdminApproved,
                ],
            ],
            1,
        ];
    }
}
