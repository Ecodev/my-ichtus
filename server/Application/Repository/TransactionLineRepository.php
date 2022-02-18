<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\Account;
use Application\Model\User;
use Cake\Chronos\Chronos;
use Cake\Chronos\Date;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;
use Money\Money;

class TransactionLineRepository extends AbstractRepository implements LimitedAccessSubQuery
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

        return 'SELECT transaction_line.id FROM transaction_line
              JOIN account ON transaction_line.debit_id = account.id OR transaction_line.credit_id = account.id 
              WHERE account.owner_id = ' . $id;
    }

    /**
     * Compute the total balance by credit or debit account and date range.
     *
     * @param null|Date $dateStart the lines from this date, included
     * @param null|Date $dateEnd the line until this date, included
     */
    public function totalBalance(?Account $debitAccount, ?Account $creditAccount, ?Date $dateStart = null, ?Date $dateEnd = null): Money
    {
        if ($debitAccount === null && $creditAccount === null) {
            throw new Exception('At least one debit or credit account is needed to compute the total balance');
        }

        $qb = $this->getEntityManager()->getConnection()->createQueryBuilder()
            ->select('SUM(balance)')
            ->from('transaction_line');

        if ($debitAccount) {
            $qb->andWhere('debit_id = :debit')
                ->setParameter('debit', $debitAccount->getId());
        }

        if ($creditAccount) {
            $qb->andWhere('credit_id = :credit')
                ->setParameter('credit', $creditAccount->getId());
        }

        if ($dateStart) {
            $qb->andWhere('DATE(transaction_date) >= :dateStart')
                ->setParameter('dateStart', $dateStart);
        }

        if ($dateEnd) {
            $qb->andWhere('DATE(transaction_date) <= :dateEnd')
                ->setParameter('dateEnd', $dateEnd);
        }

        $result = $qb->executeQuery();

        return Money::CHF((int) $result->fetchOne());
    }

    public function importedExists(string $importedId, Chronos $transactionDate): bool
    {
        $connection = $this->getEntityManager()->getConnection();
        $count = $connection->fetchOne('SELECT COUNT(*) > 0 FROM transaction_line WHERE imported_id = :importedId AND transaction_date = :transactionDate', [
            'importedId' => $importedId,
            'transactionDate' => $transactionDate,
        ]);

        return (bool) $count;
    }
}
