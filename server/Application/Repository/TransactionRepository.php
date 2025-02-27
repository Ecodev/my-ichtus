<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Api\Helper;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;
use Ecodev\Felix\Utility;

/**
 * @extends AbstractRepository<Transaction>
 */
class TransactionRepository extends AbstractRepository implements LimitedAccessSubQuery
{
    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     *
     * @param null|User $user
     */
    public function getAccessibleSubQuery(?\Ecodev\Felix\Model\User $user): string
    {
        if (!$user) {
            return '-1';
        }

        if (in_array($user->getRole(), [User::ROLE_ACCOUNTING_VERIFICATOR, User::ROLE_RESPONSIBLE, User::ROLE_ADMINISTRATOR], true)) {
            return '';
        }

        if ($user->getOwner()) {
            $id = $user->getOwner()->getId();
        } else {
            $id = $user->getId();
        }

        return 'SELECT transaction.id FROM transaction
              JOIN transaction_line ON transaction.id = transaction_line.transaction_id
              JOIN account ON transaction_line.debit_id = account.id OR transaction_line.credit_id = account.id 
              WHERE account.owner_id = ' . $id;
    }

    public function hydrateLinesAndFlush(Transaction $transaction, array $lines): void
    {
        if (!$lines) {
            throw new Exception('A Transaction must have at least one TransactionLine');
        }

        // Destroy all previously existing TransactionLine
        foreach ($transaction->getTransactionLines() as $line) {
            $this->getEntityManager()->remove($line);
        }
        $transaction->getTransactionLines()->clear();

        $accounts = [];
        foreach ($lines as $line) {
            $transactionLine = new TransactionLine();
            Helper::hydrate($transactionLine, $line);
            if (!$transactionLine->getCredit() && !$transactionLine->getDebit()) {
                throw new Exception('Cannot create a TransactionLine without any account');
            }
            $accounts[] = $transactionLine->getCredit();
            $accounts[] = $transactionLine->getDebit();

            $transactionLine->setTransaction($transaction);
            $transactionLine->setTransactionDate($transaction->getTransactionDate());
            $this->getEntityManager()->persist($transactionLine);
        }

        $this->getEntityManager()->persist($transaction);
        $this->flushWithFastTransactionLineTriggers();

        // Be sure to refresh the new account balance that were computed by DB triggers
        $accounts = array_filter(Utility::unique($accounts));
        foreach ($accounts as $account) {
            $this->getEntityManager()->refresh($account);
        }
    }

    /**
     * This is a replacement for `_em()->flush();` for when you are flushing a lot of transaction lines.
     *
     * It does the exact same thing as `_em()->flush();`, except it will disable transaction line
     * triggers temporarily and execute the de-duplicated stocked procedures at the very end. So we
     * avoid re-computing the same thing over and over.
     */
    public function flushWithFastTransactionLineTriggers(): void
    {
        $transactions = [];
        $accounts = [];

        $unitOfWork = $this->getEntityManager()->getUnitOfWork();
        $unitOfWork->computeChangeSets();

        $inserted = $unitOfWork->getScheduledEntityInsertions();
        $updated = $unitOfWork->getScheduledEntityUpdates();
        $deleted = $unitOfWork->getScheduledEntityDeletions();

        // Remember the IDs before deleting them
        foreach ($deleted as $object) {
            if ($object instanceof TransactionLine) {
                $transactions[] = $object->getTransaction()->getId();
                $accounts[] = $object->getDebit()?->getId();
                $accounts[] = $object->getCredit()?->getId();
            }
        }

        $this->getEntityManager()->getConnection()->executeStatement('SET @disable_triggers_for_mass_transaction_line = true;');
        $this->getEntityManager()->flush();

        // Get the (possibly new) IDs possibly affected by this flush
        foreach ([...$inserted, ...$updated] as $object) {
            if ($object instanceof TransactionLine) {
                $transactions[] = $object->getTransaction()->getId();
                $accounts[] = $object->getDebit()?->getId();
                $accounts[] = $object->getCredit()?->getId();
            }
        }

        $transactions = array_filter(array_unique($transactions));
        $accounts = array_filter(array_unique($accounts));

        // Keep everything in a single string to save very precious time in a single DB round trip
        $sql
            = implode(PHP_EOL, array_map(fn (int $transaction) => "CALL update_transaction_balance($transaction);", $transactions)) . PHP_EOL
            . implode(PHP_EOL, array_map(fn (int $account) => "CALL update_account_balance($account);", $accounts)) . PHP_EOL
            . 'SET @disable_triggers_for_mass_transaction_line = false;';

        // Compute balance for all objects that may have been affected
        $this->getEntityManager()->getConnection()->executeStatement($sql);
    }
}
