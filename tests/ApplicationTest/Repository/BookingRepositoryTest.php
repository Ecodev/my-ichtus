<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
use Application\Enum\UserStatus;
use Application\Model\Booking;
use Application\Model\User;
use Application\Repository\BookingRepository;
use Cake\Chronos\Chronos;
use Ecodev\Felix\Utility;

class BookingRepositoryTest extends AbstractRepositoryTest
{
    private BookingRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Booking::class);
        Chronos::setTestNow(new Chronos('2020-01-01'));
    }

    protected function tearDown(): void
    {
        Chronos::setTestNow(null);
        parent::tearDown();
    }

    public function testGetAllToInvoice(): void
    {
        $bookings = $this->repository->getAllToInvoice();
        $actual = Utility::modelToId($bookings);

        $expected = [
            4004,
            4005,
            4015,
            4007,
            4017,
        ];

        self::assertSame($expected, $actual);
    }

    public function testGetAllToInvoiceForUser(): void
    {
        $user = $this->getEntityManager()->getRepository(User::class)->getOneById(1005);

        $bookings = $this->repository->getAllToInvoice($user);
        $actual = Utility::modelToId($bookings);

        $expected = [
            4007,
        ];

        self::assertSame($expected, $actual);
    }

    private function insertTestData(array $data): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $connection->executeQuery('DELETE FROM booking');

        foreach ($data as $user) {
            $bookings = $user['bookings'] ?? [];
            $account = $user['account'] ?? null;

            unset($user['bookings'], $user['account']);
            $connection->insert('user', $user);
            $userId = $connection->lastInsertId();

            foreach ($bookings as $booking) {
                $booking['owner_id'] = $userId;

                $bookable = $booking['bookable'] ?? null;
                unset($booking['bookable']);

                if ($bookable) {
                    $connection->insert('bookable', $bookable);
                    $bookableId = $connection->lastInsertId();
                    $booking['bookable_id'] = $bookableId;
                }

                $connection->insert('booking', $booking);
            }

            if ($account) {
                $connection->insert('account', [
                    'owner_id' => $userId,
                ]);
                $accountId = $connection->lastInsertId();

                $connection->insert('transaction', []);
                $transactionId = $connection->lastInsertId();

                foreach ($account['transaction_lines'] as $line) {
                    $line['transaction_id'] = $transactionId;
                    $line['debit_id'] = $accountId;

                    // Automatically link to last bookable created
                    $line['bookable_id'] = $bookableId ?? null;

                    $connection->insert('transaction_line', $line);
                }
            }
        }
    }

    /**
     * @dataProvider providerGetAllToInvoiceAllCases
     */
    public function testGetAllToInvoiceAllCases(array $data, array $expected): void
    {
        $this->insertTestData($data);
        $bookings = $this->repository->getAllToInvoice();

        $actual = [];
        foreach ($bookings as $a) {
            $actual[] = $a->getBookable()->getName();
        }

        self::assertSame($expected, $actual);
    }

    public static function providerGetAllToInvoiceAllCases(): iterable
    {
        $normal = [
            [
                'role' => User::ROLE_MEMBER,
                'status' => UserStatus::Active->value,
                'bookings' => [
                    [
                        'start_date' => '2019-02-25',
                        'end_date' => null,
                        'status' => BookingStatus::Booked->value,
                        'bookable' => [
                            'name' => 'cotisation',
                            'booking_type' => BookingType::Mandatory->value,
                            'is_active' => true,
                            'periodic_price' => '25.00',
                        ],
                    ],
                    [
                        'start_date' => '2020-01-01',
                        'end_date' => null,
                        'status' => BookingStatus::Booked->value,
                        'bookable' => [
                            'name' => 'casier',
                            'booking_type' => BookingType::AdminAssigned->value,
                            'is_active' => true,
                            'periodic_price' => '25.00',
                        ],
                    ],
                ],
                'account' => [
                    'transaction_lines' => [
                        [
                            'balance' => '5.00',
                            'transaction_date' => '2019-02-25',
                        ],
                    ],
                ],
            ],
        ];

        $inactiveUser = $normal;
        $inactiveUser[0]['status'] = UserStatus::Inactive->value;

        $archivedUser = $normal;
        $archivedUser[0]['status'] = UserStatus::Archived->value;

        $newUser = $normal;
        $newUser[0]['status'] = UserStatus::New->value;

        $bookingOnlyUser = $normal;
        $bookingOnlyUser[0]['role'] = User::ROLE_BOOKING_ONLY;

        $individualUser = $normal;
        $individualUser[0]['role'] = User::ROLE_INDIVIDUAL;

        $trainerUser = $normal;
        $trainerUser[0]['role'] = User::ROLE_TRAINER;

        $responsibleUser = $normal;
        $responsibleUser[0]['role'] = User::ROLE_RESPONSIBLE;

        $administratorUser = $normal;
        $administratorUser[0]['role'] = User::ROLE_ADMINISTRATOR;

        $futureBookingThisYear = $normal;
        $futureBookingThisYear[0]['bookings'][0]['start_date'] = '2019-12-31';

        $futureBookingNextYear = $normal;
        $futureBookingNextYear[0]['bookings'][0]['start_date'] = '2021-01-01';

        $terminatedBooking = $normal;
        $terminatedBooking[0]['bookings'][0]['end_date'] = '2019-01-01';

        $terminatedBooking = $normal;
        $terminatedBooking[0]['bookings'][0]['end_date'] = '2019-01-01';

        $terminatedBookingNextYear = $normal;
        $terminatedBookingNextYear[0]['bookings'][0]['end_date'] = '2021-01-01';

        $applicationBooking = $normal;
        $applicationBooking[0]['bookings'][0]['status'] = BookingStatus::Application->value;

        $processedBooking = $normal;
        $processedBooking[0]['bookings'][0]['status'] = BookingStatus::Processed->value;

        $selfApprovedBookable = $normal;
        $selfApprovedBookable[0]['bookings'][0]['bookable']['booking_type'] = BookingType::SelfApproved->value;

        $applicationBookable = $normal;
        $applicationBookable[0]['bookings'][0]['bookable']['booking_type'] = BookingType::Application->value;

        $inactiveBookable = $normal;
        $inactiveBookable[0]['bookings'][0]['bookable']['is_active'] = false;

        $freeBookable = $normal;
        $freeBookable[0]['bookings'][0]['bookable']['periodic_price'] = 0;

        $negativeBookable = $normal;
        $negativeBookable[0]['bookings'][0]['bookable']['periodic_price'] = -10;

        $existingTransactionThisYear = $normal;
        $existingTransactionThisYear[0]['account']['transaction_lines'][0]['transaction_date'] = '2020-02-01';

        $existingTransactionNextYear = $normal;
        $existingTransactionNextYear[0]['account']['transaction_lines'][0]['transaction_date'] = '2021-02-01';
        yield 'normal user get casier and cotisation' => [
            $normal,
            ['casier', 'cotisation'],
        ];
        yield 'inactive user get casier and cotisation' => [
            $inactiveUser,
            ['casier', 'cotisation'],
        ];
        yield 'archived user get nothing' => [
            $archivedUser,
            [],
        ];
        yield 'new user get casier and cotisation' => [
            $newUser,
            ['casier', 'cotisation'],
        ];
        yield 'bookingOnly user get nothing' => [
            $bookingOnlyUser,
            [],
        ];
        yield 'individual user get casier and cotisation so it can be invoiced to family owner' => [
            $individualUser,
            ['casier', 'cotisation'],
        ];
        yield 'trainer user get casier and cotisation' => [
            $trainerUser,
            ['casier', 'cotisation'],
        ];
        yield 'responsible user get casier and cotisation' => [
            $responsibleUser,
            ['casier', 'cotisation'],
        ];
        yield 'administrator user get casier and cotisation' => [
            $administratorUser,
            ['casier', 'cotisation'],
        ];
        yield 'future booking this year are still counted' => [
            $futureBookingThisYear,
            ['casier', 'cotisation'],
        ];
        yield 'future booking next year are not yet counted' => [
            $futureBookingNextYear,
            ['casier'],
        ];
        yield 'terminated booking are not counted anymore' => [
            $terminatedBooking,
            ['casier'],
        ];
        yield 'terminated booking next year are not yet terminated so must be counted' => [
            $terminatedBookingNextYear,
            ['casier', 'cotisation'],
        ];
        yield 'application booking is ignored' => [
            $applicationBooking,
            ['casier'],
        ];
        yield 'processsed booking is ignored' => [
            $processedBooking,
            ['casier'],
        ];
        yield 'self approved bookable is not counted' => [
            $selfApprovedBookable,
            ['casier'],
        ];
        yield 'application bookable is not counted' => [
            $applicationBookable,
            ['casier'],
        ];
        yield 'inactive bookable is not counted' => [
            $inactiveBookable,
            ['casier'],
        ];
        yield 'free bookable is not counted' => [
            $freeBookable,
            ['casier'],
        ];
        yield 'negative bookable is counted' => [
            $negativeBookable,
            ['casier', 'cotisation'],
        ];
        yield 'existing transaction for this year should not be re-created' => [
            $existingTransactionThisYear,
            ['cotisation'],
        ];
        yield 'existing transaction for next year have no impact' => [
            $existingTransactionNextYear,
            ['casier', 'cotisation'],
        ];
    }
}
