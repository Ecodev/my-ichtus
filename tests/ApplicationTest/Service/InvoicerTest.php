<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\BookingTypeType;
use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Service\Invoicer;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Money\Money;
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

    /**
     * @dataProvider providerInvoiceInitial
     */
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
        $booking->setStatus(BookingStatusType::BOOKED);

        $account = $user->getAccount();

        if ($expected === []) {
            self::assertNull($account);
        } else {
            $all = array_merge(
                $account->getCreditTransactionLines()->toArray(),
                $account->getDebitTransactionLines()->toArray()
            );
            $actual = [];

            $transaction = null;
            /** @var TransactionLine $t */
            foreach ($all as $t) {
                if (!$transaction) {
                    $transaction = $t->getTransaction();
                    self::assertNotNull($transaction, 'must belong to a transaction');
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

    public function providerInvoiceInitial(): array
    {
        return [
            'free booking should create nothing' => [
                Money::CHF(0),
                Money::CHF(0),
                [],
            ],
            'only initial' => [
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
            ],
            'only periodic' => [
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
            ],
            'both initial and periodic should create two lines' => [
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
            ],
            'negative balance should swap accounts' => [
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
        $bookingWithoutOwner->setStatus(BookingStatusType::BOOKED);

        $bookingWithoutBookable = new Booking();
        $bookingWithoutBookable->setOwner($user);
        $bookingWithoutBookable->setStatus(BookingStatusType::BOOKED);

        $bookingWithoutStatus = new Booking();
        $bookingWithoutStatus->setBookable($bookable);
        $bookingWithoutStatus->setOwner($user);

        self::assertNull($user->getAccount(), 'invoicer is only called when we have both an owner and a bookable');
    }

    /**
     * @dataProvider providerShouldInvoiceInitial
     */
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

    public function providerShouldInvoiceInitial(): array
    {
        return [
            'create MANDATORY booking should invoice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                1,
            ],
            'update MANDATORY booking should not invoice' => [
                [
                    'id' => 123,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                0,
            ],
            'create MANDATORY booking that is processed (not booked) should not invoice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::PROCESSED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                0,
            ],
            'create MANDATORY booking that is application (not booked) should not invoice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::APPLICATION,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                0,
            ],
            'create MANDATORY booking without creditAccount should not invoice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => false,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                0,
            ],
            'create MANDATORY free booking should not invoice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(0),
                        'periodicPrice' => Money::CHF(0),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                0,
            ],
            'create MANDATORY booking with free initialPrice and non-free periodicPrice should still actually invoice, because we also invoice periodicPrice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(0),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                1,
            ],
            'create APPLICATION booking should not invoice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::APPLICATION,
                    ],
                ],
                0,
            ],
            'update MANDATORY booking to change status from APPLICATION to BOOKED should invoice' => [
                [
                    'id' => 123,
                    'previousStatus' => BookingStatusType::APPLICATION,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                1,
            ],
            'update MANDATORY booking to change status from BOOKED to BOOKED should not invoice' => [
                [
                    'id' => 123,
                    'previousStatus' => BookingStatusType::BOOKED,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                0,
            ],
            'update MANDATORY booking to change status from PROCESSED to BOOKED should not invoice' => [
                [
                    'id' => 123,
                    'previousStatus' => BookingStatusType::PROCESSED,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::MANDATORY,
                    ],
                ],
                0,
            ],

            'create ADMIN_APPROVED booking should invoice' => [
                [
                    'id' => null,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::ADMIN_APPROVED,
                    ],
                ],
                1,
            ],
            'update ADMIN_APPROVED booking should not invoice' => [
                [
                    'id' => 123,
                    'previousStatus' => null,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::ADMIN_APPROVED,
                    ],
                ],
                0,
            ],
            'update ADMIN_APPROVED booking to change status from APPLICATION to BOOKED should invoice' => [
                [
                    'id' => 123,
                    'previousStatus' => BookingStatusType::APPLICATION,
                    'status' => BookingStatusType::BOOKED,
                    'bookable' => [
                        'creditAccount' => true,
                        'initialPrice' => Money::CHF(100),
                        'periodicPrice' => Money::CHF(100),
                        'bookingType' => BookingTypeType::ADMIN_APPROVED,
                    ],
                ],
                1,
            ],
        ];
    }
}
