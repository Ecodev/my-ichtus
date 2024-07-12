<?php

declare(strict_types=1);

namespace Application\Service;

use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
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
 * Service to create transactions for non-free booking, if needed, for all users or one user.
 */
class Invoicer
{
    private int $count = 0;

    private readonly BookingRepository $bookingRepository;

    public function __construct(private readonly EntityManager $entityManager)
    {
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

    public function invoiceInitial(User $user, Booking $booking, ?BookingStatus $previousStatus): int
    {
        $this->count = 0;
        $this->bookingRepository->getAclFilter()->runWithoutAcl(function () use ($user, $booking, $previousStatus): void {
            if ($this->shouldInvoiceInitial($booking, $previousStatus)) {
                $this->createTransaction($user, [$booking], true);
            }
        });

        return $this->count;
    }

    private function shouldInvoiceInitial(Booking $booking, ?BookingStatus $previousStatus): bool
    {
        $bookable = $booking->getBookable();

        // Only invoice a booking that is really booked or processed (and not an application)
        if (!in_array($booking->getStatus(), [BookingStatus::Booked, BookingStatus::Processed], true)) {
            return false;
        }

        // Cannot invoice if we don't know where the money goes
        if (!$bookable->getCreditAccount()) {
            return false;
        }

        // Nothing to invoice if the bookable is free
        if ($bookable->getInitialPrice()->isZero() && $bookable->getPeriodicPrice()->isZero()) {
            return false;
        }

        // Never invoice bookings of application type bookable, because they are only used to request the admin to create the actual booking
        if ($bookable->getBookingType() === BookingType::Application) {
            return false;
        }

        // If a booking status has been changed from `APPLICATION to `BOOKED` or `PROCESSED`, then it is OK to invoice
        if ($previousStatus === BookingStatus::Application) {
            return true;
        }

        // Otherwise, never invoice a booking that is updated, and only invoice a booking that is created right now
        if ($booking->getId()) {
            return false;
        }

        return true;
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
                $this->createTransactionLine($transaction, $bookable, $account, $balance, 'Prestation ponctuelle', $user->getName());
            }

            $balance = $this->calculatePeriodicBalance($booking);
            $this->createTransactionLine($transaction, $bookable, $account, $balance, 'Prestation annuelle', $user->getName());
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

    private function createTransactionLine(Transaction $transaction, Bookable $bookable, Account $account, Money $balance, string $name, string $remarks = ''): void
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
        $transactionLine->setRemarks($remarks);
    }
}
