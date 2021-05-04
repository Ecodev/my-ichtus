<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\BookingTypeType;
use Application\Model\Booking;
use Application\Model\User;
use Application\Repository\BookingRepository;
use Cake\Chronos\Date;

class BookingRepositoryTest extends AbstractRepositoryTest
{
    /**
     * @var BookingRepository
     */
    private $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Booking::class);
        Date::setTestNow(new Date('2020-01-01'));
    }

    protected function tearDown(): void
    {
        Date::setTestNow(null);
        parent::tearDown();
    }

    public function testGetAllToInvoice(): void
    {
        $bookings = $this->repository->getAllToInvoice();
        $actual = $this->modelToIds($bookings);

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
        $actual = $this->modelToIds($bookings);

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
     * @dataProvider providerGetAllToInvoice
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

    public function providerGetAllToInvoice(): array
    {
        $normal = [
            [
                'role' => User::ROLE_MEMBER,
                'status' => User::STATUS_ACTIVE,
                'bookings' => [
                    [
                        'start_date' => '2019-02-25',
                        'end_date' => null,
                        'status' => BookingStatusType::BOOKED,
                        'bookable' => [
                            'name' => 'cotisation',
                            'booking_type' => BookingTypeType::MANDATORY,
                            'is_active' => true,
                            'periodic_price' => '25.00',
                        ],
                    ],
                    [
                        'start_date' => '2020-01-01',
                        'end_date' => null,
                        'status' => BookingStatusType::BOOKED,
                        'bookable' => [
                            'name' => 'casier',
                            'booking_type' => BookingTypeType::ADMIN_ONLY,
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
        $inactiveUser[0]['status'] = User::STATUS_INACTIVE;

        $archivedUser = $normal;
        $archivedUser[0]['status'] = User::STATUS_ARCHIVED;

        $newUser = $normal;
        $newUser[0]['status'] = User::STATUS_NEW;

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
        $applicationBooking[0]['bookings'][0]['status'] = BookingStatusType::APPLICATION;

        $processedBooking = $normal;
        $processedBooking[0]['bookings'][0]['status'] = BookingStatusType::PROCESSED;

        $selfApprovedBookable = $normal;
        $selfApprovedBookable[0]['bookings'][0]['bookable']['booking_type'] = BookingTypeType::SELF_APPROVED;

        $adminApprovedBookable = $normal;
        $adminApprovedBookable[0]['bookings'][0]['bookable']['booking_type'] = BookingTypeType::ADMIN_APPROVED;

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

        return [
            'normal user get casier and cotisation' => [
                $normal,
                ['casier', 'cotisation'],
            ],
            'inactive user get casier and cotisation' => [
                $inactiveUser,
                ['casier', 'cotisation'],
            ],
            'archived user get nothing' => [
                $archivedUser,
                [],
            ],
            'new user get casier and cotisation' => [
                $newUser,
                ['casier', 'cotisation'],
            ],
            'bookingOnly user get nothing' => [
                $bookingOnlyUser,
                [],
            ],
            'individual user get casier and cotisation so it can be invoiced to family owner' => [
                $individualUser,
                ['casier', 'cotisation'],
            ],
            'trainer user get casier and cotisation' => [
                $trainerUser,
                ['casier', 'cotisation'],
            ],
            'responsible user get casier and cotisation' => [
                $responsibleUser,
                ['casier', 'cotisation'],
            ],
            'administrator user get casier and cotisation' => [
                $administratorUser,
                ['casier', 'cotisation'],
            ],
            'future booking this year are still counted' => [
                $futureBookingThisYear,
                ['casier', 'cotisation'],
            ],
            'future booking next year are not yet counted' => [
                $futureBookingNextYear,
                ['casier'],
            ],
            'terminated booking are not counted anymore' => [
                $terminatedBooking,
                ['casier'],
            ],
            'terminated booking next year are not yet terminated so must be counted' => [
                $terminatedBookingNextYear,
                ['casier', 'cotisation'],
            ],
            'application booking is ignored' => [
                $applicationBooking,
                ['casier'],
            ],
            'processsed booking is ignored' => [
                $processedBooking,
                ['casier'],
            ],
            'self approvable bookable is not counted' => [
                $selfApprovedBookable,
                ['casier'],
            ],
            'admin approvable bookable is counted' => [
                $adminApprovedBookable,
                ['casier', 'cotisation'],
            ],
            'inactive bookable is not counted' => [
                $inactiveBookable,
                ['casier'],
            ],
            'free bookable is not counted' => [
                $freeBookable,
                ['casier'],
            ],
            'negative bookable is counted' => [
                $negativeBookable,
                ['casier', 'cotisation'],
            ],
            'existing transaction for this year should not be re-created' => [
                $existingTransactionThisYear,
                ['cotisation'],
            ],
            'existing transaction for next year have no impact' => [
                $existingTransactionNextYear,
                ['casier', 'cotisation'],
            ],
        ];
    }

    /**
     * @param Booking[] $bookings
     */
    private function modelToIds(array $bookings): array
    {
        $ids = [];
        foreach ($bookings as $a) {
            $ids[] = $a->getId();
        }

        return $ids;
    }
}
