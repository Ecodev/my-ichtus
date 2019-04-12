<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Service\Invoicer;
use ApplicationTest\Traits\TestWithTransaction;
use PHPUnit\Framework\TestCase;

class InvoicerTest extends TestCase
{
    use TestWithTransaction;

    public function testInvoice(): void
    {
        global $container;

        /** @var Invoicer $invoicer */
        $invoicer = $container->get(Invoicer::class);
        $actual = $invoicer->invoicePeriodic();
        self::assertSame(2, $actual);

        _em()->flush();

        $actual2 = $invoicer->invoicePeriodic();
        self::assertSame(0, $actual2, 'should not invoice things that are already invoiced');
    }

    /**
     * @dataProvider providerInvoiceInitial
     *
     * @param string $initialPrice
     * @param string $periodicPrice
     * @param array $expected
     */
    public function testInvoiceInitial(string $initialPrice, string $periodicPrice, array $expected): void
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

        $account = $user->getAccount();

        if ($expected === []) {
            self::assertNull($account);
        } else {
            $all = array_merge(
                $account->getCreditTransactionLines()->toArray(),
                $account->getDebitTransactionLines()->toArray()
            );
            $actual = [];

            /** @var TransactionLine $t */
            $transaction = null;
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
                    $t->getBalance(),
                ];
            }

            self::assertSame($expected, $actual);
        }
    }

    public function providerInvoiceInitial(): array
    {
        return [
            'free booking should create nothing' => [
                '0',
                '0',
                [],
            ],
            'only initial' => [
                '10',
                '0',
                [
                    [
                        'Paiement ponctuel',
                        'My bookable',
                        'John Doe',
                        'Bookable account',
                        '10',
                    ],
                ],
            ],
            'only periodic' => [
                '0',
                '90',
                [
                    [
                        'Paiement annuel',
                        'My bookable',
                        'John Doe',
                        'Bookable account',
                        '90',
                    ],
                ],
            ],
            'both initial and periodic should create two lines' => [
                '10',
                '90',
                [
                    [
                        'Paiement ponctuel',
                        'My bookable',
                        'John Doe',
                        'Bookable account',
                        '10',
                    ],
                    [
                        'Paiement annuel',
                        'My bookable',
                        'John Doe',
                        'Bookable account',
                        '90',
                    ],
                ],
            ],
            'negative balance should swap accounts' => [
                '-10',
                '-90',
                [
                    [
                        'Paiement ponctuel',
                        'My bookable',
                        'Bookable account',
                        'John Doe',
                        '10',
                    ],
                    [
                        'Paiement annuel',
                        'My bookable',
                        'Bookable account',
                        'John Doe',
                        '90',
                    ],
                ],
            ],
        ];
    }

    public function testInvoicerNotCalled(): void
    {
        $user = new User();
        $bookable = new Bookable();
        $bookable->setInitialPrice('1');
        $bookable->setPeriodicPrice('1');

        $bookingWithoutOwner = new Booking();
        $bookingWithoutOwner->setBookable($bookable);

        $bookingWithoutBookable = new Booking();
        $bookingWithoutBookable->setOwner($user);

        self::assertNull($user->getAccount(), 'invoicer is only called when we have both an owner and a bookable');
    }
}
