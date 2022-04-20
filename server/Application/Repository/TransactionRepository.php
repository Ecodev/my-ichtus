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
            return $this->getAllIdsQuery();
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
        $this->getEntityManager()->flush();

        // Be sure to refresh the new account balance that were computed by DB triggers
        $accounts = array_filter(Utility::unique($accounts));
        foreach ($accounts as $account) {
            $this->getEntityManager()->refresh($account);
        }
    }
}
