<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\DBAL\Types\BookingStatusType;
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
}
