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
use Application\Repository\BookingRepository;
use Cake\Chronos\Chronos;
use Doctrine\ORM\EntityManager;

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

    public function invoicePeriodic(?User $user = null): int
    {
        $this->count = 0;
        $this->bookingRepository->getAclFilter()->setEnabled(false);
        $bookings = $this->bookingRepository->getAllToInvoice($user);

        $user = null;
        $bookingPerUser = [];

        /** @var Booking $booking */
        foreach ($bookings as $booking) {
            if ($user !== $booking->getOwner()) {
                $this->createTransaction($user, $bookingPerUser, false);

                $user = $booking->getOwner();
                $bookingPerUser = [];
            }

            $bookingPerUser[] = $booking;
        }
        $this->createTransaction($user, $bookingPerUser, false);

        $this->bookingRepository->getAclFilter()->setEnabled(true);

        return $this->count;
    }

    public function invoiceInitial(User $user, Booking $booking): void
    {
        $this->bookingRepository->getAclFilter()->setEnabled(false);

        if ($booking->getStatus() !== BookingStatusType::BOOKED) {
            return;
        }

        $bookable = $booking->getBookable();
        if (!$bookable->getInitialPrice() && !$bookable->getPeriodicPrice()) {
            return;
        }

        $this->createTransaction($user, [$booking], true);
        $this->bookingRepository->getAclFilter()->setEnabled(true);
    }

    private function createTransaction(?User $user, array $bookings, bool $isInitial): void
    {
        if (!$user || !$bookings) {
            return;
        }

        $account = $this->entityManager->getRepository(Account::class)->getOrCreate($user);
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

    /**
     * @param Booking $booking
     *
     * @return string
     */
    private function calculateInitialBalance(Booking $booking): string
    {
        $bookable = $booking->getBookable();

        // TODO: https://support.ecodev.ch/issues/6227

        return $bookable->getInitialPrice();
    }

    /**
     * @param Booking $booking
     *
     * @return string
     */
    private function calculatePeriodicBalance(Booking $booking): string
    {
        return $booking->getPeriodicPrice();
    }

    private function createTransactionLine(Transaction $transaction, Bookable $bookable, Account $account, string $balance, string $name): void
    {
        if ($balance > 0) {
            $debit = $account;
            $credit = $bookable->getCreditAccount();
        } elseif ($balance < 0) {
            $debit = $bookable->getCreditAccount();
            $credit = $account;
            $balance = bcmul($balance, '-1'); // into positive
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
