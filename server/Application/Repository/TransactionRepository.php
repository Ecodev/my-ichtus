<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Api\Helper;
use Application\Model\Account;
use Application\Model\ExpenseClaim;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Cake\Chronos\ChronosDate;
use DateTimeInterface;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\EntityID;
use LogicException;

/**
 * @extends AbstractRepository<Transaction>
 */
class TransactionRepository extends AbstractRepository implements LimitedAccessSubQuery
{
    /**
     * The last accounting closing date, or false while it was not fetched yet.
     */
    private ChronosDate|false|null $lastClosingDate = false;

    /**
     * Clear all caches.
     */
    public function clearCache(): void
    {
        $this->lastClosingDate = false;
    }

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

    /**
     * Apply the given lines to the transaction, and flush everything. A line sent with its id is
     * updated, so it keeps what the form does not carry, such as the origin of a bank import. A
     * line sent without id is created, and an existing line that is not sent back is deleted.
     */
    public function hydrateLinesAndFlush(Transaction $transaction, array $lines): void
    {
        if (!$lines) {
            throw new Exception('A Transaction must have at least one TransactionLine');
        }

        /** @var array<int, TransactionLine> $existingLines */
        $existingLines = [];
        foreach ($transaction->getTransactionLines() as $existingLine) {
            $existingLines[(int) $existingLine->getId()] = $existingLine;
        }

        $submittedIds = array_flip($this->getSubmittedIds($lines, $existingLines));
        $deletedLines = array_diff_key($existingLines, $submittedIds);
        $lastClosingDate = $this->getLastClosingDate();

        foreach ($lines as $line) {
            $id = $this->toId($line['id'] ?? null);
            unset($line['id']);

            if ($id) {
                $transactionLine = $existingLines[$id];
                Helper::hydrate($transactionLine, $line);
            } else {
                // No id means a line the user just added to the list, or a line copied from a
                // duplicated transaction. Either way it is born here.
                $transactionLine = new TransactionLine();
                Helper::hydrate($transactionLine, $line);
                $transactionLine->setTransaction($transaction);
                $this->getEntityManager()->persist($transactionLine);
            }

            if (!$transactionLine->getCredit() && !$transactionLine->getDebit()) {
                throw new Exception('Cannot create a TransactionLine without any account');
            }

            // Only the submitted date can reach into a closed period: a line already stored there
            // would have made the whole transaction read-only
            $submittedDate = $line['transactionDate'] ?? null;
            if ($lastClosingDate && $submittedDate && $lastClosingDate->greaterThan(new ChronosDate($submittedDate))) {
                throw new Exception('Cannot date a TransactionLine before the last accounting closing');
            }
        }

        foreach ($deletedLines as $deletedLine) {
            $this->getEntityManager()->remove($deletedLine);
            $transaction->getTransactionLines()->removeElement($deletedLine);
        }

        $this->getEntityManager()->persist($transaction);

        // The flush recomputes the balances in DB, but the Account objects still hold the ones they
        // were loaded with, so they must be re-read for the response to show the new balances
        foreach (Utility::unique($this->flushWithFastTransactionLineTriggers()) as $account) {
            $this->getEntityManager()->refresh($account);
        }
    }

    /**
     * Return the ids that were sent, and refuse any that is not a line of this transaction. The
     * check looks in the lines we already have, never in the database, so an id can only ever
     * designate a line of the transaction being updated.
     *
     * @param array<int, TransactionLine> $existingLines
     *
     * @return list<int>
     */
    private function getSubmittedIds(array $lines, array $existingLines): array
    {
        $submittedIds = array_map($this->toId(...), array_filter(array_column($lines, 'id')));

        if (array_diff($submittedIds, array_keys($existingLines))) {
            throw new Exception('A TransactionLine can only be updated by the Transaction it belongs to');
        }

        return array_values($submittedIds);
    }

    /**
     * The id comes as an `EntityID` from the API, and as a plain id when called from PHP.
     */
    private function toId(mixed $id): int
    {
        return (int) ($id instanceof EntityID ? $id->getId() : $id);
    }

    /**
     * This is a replacement for `_em()->flush();` for when you are flushing a lot of transaction lines.
     *
     * It does the exact same thing as `_em()->flush();`, except it will disable transaction line
     * triggers temporarily and execute the de-duplicated stocked procedures at the very end. So we
     * avoid re-computing the same thing over and over.
     *
     * @return list<Account> the accounts touched by the recalculation
     */
    public function flushWithFastTransactionLineTriggers(): array
    {
        /** @var list<int> $transactions */
        $transactions = [];
        /** @var list<Account> $accounts */
        $accounts = [];
        /** @var list<int> $accountIdsOfDeletedTransactions */
        $accountIdsOfDeletedTransactions = [];

        $unitOfWork = $this->getEntityManager()->getUnitOfWork();
        $unitOfWork->computeChangeSets();

        $inserted = $unitOfWork->getScheduledEntityInsertions();
        $updated = $unitOfWork->getScheduledEntityUpdates();
        $deleted = $unitOfWork->getScheduledEntityDeletions();

        // Remember the IDs before deleting them
        foreach ($deleted as $object) {
            if ($object instanceof TransactionLine) {
                $this->gatherTransactionLine($transactions, $accounts, $object);
            } elseif ($object instanceof Transaction) {
                $this->gatherDeletedTransaction($accountIdsOfDeletedTransactions, $object);
            } else {
                $this->throwNotAllowed($object);
            }
        }

        // The update trigger disabled below would also fix the account a line is leaving. Doctrine
        // only knows it before the flush, so read it now.
        foreach ($updated as $object) {
            if ($object instanceof TransactionLine) {
                $this->gatherPreviousAccounts($accounts, $unitOfWork->getEntityChangeSet($object));
            }
        }

        $this->getEntityManager()->getConnection()->executeStatement('SET @disable_triggers_for_mass_transaction_line = true;');
        $this->getEntityManager()->flush();

        // Get the (possibly new) IDs possibly affected by this flush
        foreach ([...$inserted, ...$updated] as $object) {
            if ($object instanceof TransactionLine) {
                $this->gatherTransactionLine($transactions, $accounts, $object);
            } elseif (!in_array($object::class, [Transaction::class, Account::class, ExpenseClaim::class], true)) {
                $this->throwNotAllowed($object);
            }
        }

        // Keep everything in a single string to save very precious time in a single DB round trip
        $sql = $this->getSqlToComputeBalance($transactions, $this->toAccountIds($accounts, $accountIdsOfDeletedTransactions))
            . 'SET @disable_triggers_for_mass_transaction_line = NULL;';

        // Compute balance for all objects that may have been affected
        $this->getEntityManager()->getConnection()->executeStatement($sql);

        return $accounts;
    }

    /**
     * @param list<int> $transactions
     * @param list<Account> $accounts
     */
    private function gatherTransactionLine(array &$transactions, array &$accounts, TransactionLine $object): void
    {
        $transactionId = $object->getTransaction()->getId();
        assert($transactionId !== null);
        $transactions[] = $transactionId;

        foreach ([$object->getDebit(), $object->getCredit()] as $account) {
            if ($account) {
                $accounts[] = $account;
            }
        }
    }

    /**
     * @param list<Account> $accounts
     * @param array<string, mixed> $changeSet
     */
    private function gatherPreviousAccounts(array &$accounts, array $changeSet): void
    {
        foreach (['debit', 'credit'] as $field) {
            $change = $changeSet[$field] ?? null;
            $previous = is_array($change) ? ($change[0] ?? null) : null;
            if ($previous instanceof Account) {
                $accounts[] = $previous;
            }
        }
    }

    /**
     * @param list<Account> $accounts
     * @param list<int> $accountIds the ids already known without their object
     *
     * @return list<int>
     */
    private function toAccountIds(array $accounts, array $accountIds): array
    {
        foreach ($accounts as $account) {
            $accountId = $account->getId();
            assert($accountId !== null);

            $accountIds[] = $accountId;
        }

        return $accountIds;
    }

    /**
     * @param list<int> $accounts
     */
    private function gatherDeletedTransaction(array &$accounts, Transaction $object): void
    {
        /** @var int[] $accountIds */
        $accountIds = $this->getEntityManager()->getConnection()->fetchFirstColumn(
            <<<SQL
                SELECT debit_id FROM transaction_line WHERE transaction_id = :transaction AND debit_id IS NOT NULL 
                UNION
                SELECT credit_id FROM transaction_line WHERE transaction_id = :transaction AND credit_id IS NOT NULL
                SQL,
            [
                'transaction' => $object->getId(),
            ],
        );

        array_push($accounts, ...$accountIds);
    }

    private function throwNotAllowed(object $object): never
    {
        // If you read this code because you saw this exception thrown in production,
        // then you must review which object was trying to be inserted/updated/deleted.
        // Then, super-triple-check that that object does not have triggers, or other
        // mechanisms, that would be broken/not ran by this method. If you are
        // really-really-really sure that the DB content stays consistent, then you can
        // allowlist the object here.
        throw new LogicException('flushWithFastTransactionLineTriggers() must not be used with ' . $object::class);
    }

    /**
     * @param list<int> $transactions
     * @param list<int> $accounts
     */
    private function getSqlToComputeBalance(array $transactions, array $accounts): string
    {
        $sql = '';

        $transactions = array_filter(array_unique($transactions));
        foreach ($transactions as $transaction) {
            $sql .= "CALL update_transaction_balance($transaction);" . PHP_EOL;
        }

        $accounts = array_filter(array_unique($accounts));
        foreach ($accounts as $account) {
            $sql .= "CALL update_account_balance($account);" . PHP_EOL;
        }

        return $sql;
    }

    public function getLastClosingDate(): ?ChronosDate
    {
        if ($this->lastClosingDate === false) {
            $this->lastClosingDate = $this->fetchLastClosingDate();
        }

        return $this->lastClosingDate;
    }

    private function fetchLastClosingDate(): ?ChronosDate
    {
        $date = $this->getEntityManager()->getConnection()->fetchOne(
            'SELECT transaction_date FROM transaction WHERE is_closing ORDER BY transaction_date DESC LIMIT 1',
        );

        if (!$date) {
            return null;
        }

        return new ChronosDate($date);
    }

    /**
     * A transaction is closed as soon as one of its dates, the stored one or the submitted one,
     * is before the last accounting closing. Otherwise a closed transaction could escape the
     * closing simply by moving its date after last closing date.
     */
    public function isClosed(Transaction $transaction): bool
    {
        $lastClosingDate = $this->getLastClosingDate();
        if (!$lastClosingDate) {
            return false;
        }

        $oldestDate = new ChronosDate($transaction->getTransactionDate());
        $oldestDate = $this->keepOldest($oldestDate, $this->getStoredDate($transaction));

        // The accounting period is delimited by the dates of the lines, not by the date of the
        // transaction grouping them, so a single line is enough to reach into a closed period
        foreach ($transaction->getTransactionLines() as $line) {
            $oldestDate = $this->keepOldest($oldestDate, new ChronosDate($line->getTransactionDate()));
            $oldestDate = $this->keepOldest($oldestDate, $this->getStoredDate($line));
        }

        return $lastClosingDate->greaterThan($oldestDate);
    }

    /**
     * The date the entity was loaded with, absent while creating it because it was never stored yet.
     */
    private function getStoredDate(Transaction|TransactionLine $entity): ?ChronosDate
    {
        $storedDate = $this->getEntityManager()->getUnitOfWork()->getOriginalEntityData($entity)['transactionDate'] ?? null;
        assert($storedDate === null || $storedDate instanceof DateTimeInterface);

        return $storedDate ? new ChronosDate($storedDate) : null;
    }

    private function keepOldest(ChronosDate $oldest, ?ChronosDate $candidate): ChronosDate
    {
        return $candidate && $candidate->lessThan($oldest) ? $candidate : $oldest;
    }
}
