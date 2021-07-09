<?php

declare(strict_types=1);

namespace Application\Service;

use Application\DBAL\Types\BookingStatusType;
use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\BookingRepository;
use Cake\Chronos\Chronos;
use Doctrine\ORM\EntityManager;
use Money\Money;

/**
 * Service to create transactions for non-free booking, if needed, for all users or one user
 */
class Invoicer
{
    /**
     * @var EntityManager
     */
    private $entityManager;

    /**
     * @var int
     */
    private $count = 0;

    /**
     * @var BookingRepository
     */
    private $bookingRepository;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
        $this->bookingRepository = $this->entityManager->getRepository(Booking::class);
    }

    public function invoicePeriodic(?User $onlyUser = null): int
    {
        $this->count = 0;

        $this->bookingRepository->getAclFilter()->runWithoutAcl(function () use ($onlyUser): void {
            $bookings = $this->bookingRepository->getAllToInvoice($onlyUser);

            $user = null;
            $bookingPerUser = [];

            /** @var Booking $booking */
            foreach ($bookings as $booking) {
                $nextUser = $booking->getOwner();
                if ($user !== $nextUser) {
                    $this->createTransaction($user, $bookingPerUser, false);

                    $user = $nextUser;
                    $bookingPerUser = [];
                }

                $bookingPerUser[] = $booking;
            }
            $this->createTransaction($user, $bookingPerUser, false);
        });

        return $this->count;
    }

    public function invoiceInitial(User $user, Booking $booking, ?string $previousStatus = null): void
    {
        $this->bookingRepository->getAclFilter()->runWithoutAcl(function () use ($user, $booking, $previousStatus): void {
            if ($previousStatus !== BookingStatusType::APPLICATION || !in_array($booking->getStatus(), [BookingStatusType::BOOKED, BookingStatusType::PROCESSED], true)) {
                return;
            }
            $bookable = $booking->getBookable();
            if (!$bookable->getCreditAccount() || ($bookable->getInitialPrice()->isZero() && $bookable->getPeriodicPrice()->isZero())) {
                return;
            }

            $this->createTransaction($user, [$booking], true);
        });
    }

    private function createTransaction(?User $user, array $bookings, bool $isInitial): void
    {
        if (!$user || !$bookings) {
            return;
        }

        /** @var AccountRepository $accountRepository */
        $accountRepository = $this->entityManager->getRepository(Account::class);
        $account = $accountRepository->getOrCreate($user);
        $transaction = new Transaction();
        $transaction->setTransactionDate(Chronos::now());
        $transaction->setName('Cotisation et services ' . Chronos::today()->format('Y'));
        $this->entityManager->persist($transaction);

        foreach ($bookings as $booking) {
            $bookable = $booking->getBookable();
            if ($isInitial) {
                $balance = $this->calculateInitialBalance($booking);
                $this->createTransactionLine($transaction, $bookable, $account, $balance, 'Prestation ponctuelle');
            }

            $balance = $this->calculatePeriodicBalance($booking);
            $this->createTransactionLine($transaction, $bookable, $account, $balance, 'Prestation annuelle');
        }

        ++$this->count;
    }

    private function calculateInitialBalance(Booking $booking): Money
    {
        $bookable = $booking->getBookable();

        // TODO: https://support.ecodev.ch/issues/6227

        return $bookable->getInitialPrice();
    }

    private function calculatePeriodicBalance(Booking $booking): Money
    {
        return $booking->getPeriodicPrice();
    }

    private function createTransactionLine(Transaction $transaction, Bookable $bookable, Account $account, Money $balance, string $name): void
    {
        if ($balance->isPositive()) {
            $debit = $account;
            $credit = $bookable->getCreditAccount();
        } elseif ($balance->isNegative()) {
            $debit = $bookable->getCreditAccount();
            $credit = $account;
            $balance = $balance->absolute();
        } else {
            // Never create a line with 0 balance
            return;
        }

        $transactionLine = new TransactionLine();
        $this->entityManager->persist($transactionLine);

        $transactionLine->setName($name);
        $transactionLine->setBookable($bookable);
        $transactionLine->setDebit($debit);
        $transactionLine->setCredit($credit);
        $transactionLine->setBalance($balance);
        $transactionLine->setTransaction($transaction);
        $transactionLine->setTransactionDate(Chronos::now());
    }
}
