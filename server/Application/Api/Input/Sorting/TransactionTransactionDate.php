<?php

declare(strict_types=1);

namespace Application\Api\Input\Sorting;

use Application\Model\Transaction;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Doctrine\Sorting\SortingInterface;

/**
 * Sort transactionLines by their transaction's transactionDate.
 */
class TransactionTransactionDate implements SortingInterface
{
    public function __construct() {}

    public function __invoke(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $order): void
    {
        $transaction = $uniqueNameFactory->createAliasName(Transaction::class);
        $queryBuilder->leftJoin($alias . '.transaction', $transaction);

        $queryBuilder->addOrderBy($transaction . '.transactionDate', $order);
    }
}
