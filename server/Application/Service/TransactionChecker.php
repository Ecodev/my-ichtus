<?php

declare(strict_types=1);

namespace Application\Service;

use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Format;
use Money\Money;
use WeakMap;

/**
 * Automatically check that transaction and all their transaction lines are balanced.
 */
class TransactionChecker implements EventSubscriber
{
    public function getSubscribedEvents(): array
    {
        return [Events::onFlush];
    }

    /**
     * Records all products whose stock may have changed.
     */
    public function onFlush(OnFlushEventArgs $eventArgs): void
    {
        /** @var WeakMap<Transaction, true> $transactions */
        $transactions = new WeakMap();
        $unitOfWork = $eventArgs->getObjectManager()->getUnitOfWork();
        foreach ($unitOfWork->getScheduledEntityInsertions() as $entity) {
            $this->record($transactions, $entity);
        }

        foreach ($unitOfWork->getScheduledEntityUpdates() as $entity) {
            $this->record($transactions, $entity);
        }

        foreach ($unitOfWork->getScheduledEntityDeletions() as $entity) {
            $this->record($transactions, $entity);
        }

        foreach ($transactions as $transaction => $v) {
            $this->checkBalance($transaction);
        }
    }

    /**
     * Record all transactions that must be checked.
     *
     * @param WeakMap<Transaction, true> $transactions $transactions
     */
    private function record(WeakMap $transactions, object $entity): void
    {
        if ($entity instanceof Transaction) {
            $transactions[$entity] = true;
        } elseif ($entity instanceof TransactionLine) {
            $transactions[$entity->getTransaction()] = true;
        }
    }

    private function checkBalance(Transaction $transaction): void
    {
        $totalDebit = Money::CHF(0);
        $totalCredit = Money::CHF(0);
        foreach ($transaction->getTransactionLines() as $line) {
            if ($line->getDebit()) {
                $totalDebit = $totalDebit->add($line->getBalance());
            }
            if ($line->getCredit()) {
                $totalCredit = $totalCredit->add($line->getBalance());
            }
        }

        if (!$totalDebit->equals($totalCredit)) {
            throw new Exception(_tr('Transaction %id% non-équilibrée, débits: %totalDebit%, crédits: %totalCredit%', [
                'id' => $transaction->getId() ?? 'NEW',
                'totalDebit' => Format::money($totalDebit),
                'totalCredit' => Format::money($totalCredit),
            ]));
        }
    }
}
