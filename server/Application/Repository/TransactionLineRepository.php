<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Action\ExportTransactionLinesAction;
use Application\Model\User;
use Doctrine\ORM\Query;
use Ecodev\Felix\Repository\LimitedAccessSubQuery;

class TransactionLineRepository extends AbstractRepository implements LimitedAccessSubQuery, ExportExcelInterface
{
    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     */
    public function getAccessibleSubQuery(?\Ecodev\Felix\Model\User $user): string
    {
        if (!$user) {
            return '-1';
        }

        if (in_array($user->getRole(), [User::ROLE_RESPONSIBLE, User::ROLE_ADMINISTRATOR], true)) {
            return $this->getAllIdsQuery();
        }

        return 'SELECT transaction_line.id FROM transaction_line
              JOIN account ON transaction_line.debit_id = account.id OR transaction_line.credit_id = account.id 
              WHERE account.owner_id = ' . $user->getId();
    }

    /**
     * Generates an Excel spreadsheet with the query result
     *
     * @param Query $query
     *
     * @return string name of the temporary file
     */
    public function exportExcel(Query $query): string
    {
        global $container;

        return ($container->get(ExportTransactionLinesAction::class))->generate($query);
    }
}
