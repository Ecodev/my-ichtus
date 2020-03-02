<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\AccountingDocument;
use Application\Model\ExpenseClaim;
use Application\Model\Transaction;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class TransactionWithDocumentOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the transactions that have documents',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::nonNull(self::listOf(self::nonNull(self::boolean()))),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        if (!$args) {
            return null;
        }

        if (in_array(true, $args['values'], true) && !in_array(false, $args['values'], true)) {
            $condition = '> 0';
        } elseif (in_array(false, $args['values'], true) && !in_array(true, $args['values'], true)) {
            $condition = '= 0';
        } else {
            return null;
        }

        $transactionAlias = $uniqueNameFactory->createAliasName(Transaction::class);
        $transactionDocumentAlias = $uniqueNameFactory->createAliasName(AccountingDocument::class);

        $queryBuilder->innerJoin($alias . '.transaction', $transactionAlias);
        $queryBuilder->leftJoin($transactionAlias . '.accountingDocuments', $transactionDocumentAlias);

        $expenseClaimAlias = $uniqueNameFactory->createAliasName(ExpenseClaim::class);
        $expenseClaimDocumentAlias = $uniqueNameFactory->createAliasName(AccountingDocument::class);

        $queryBuilder->leftJoin($transactionAlias . '.expenseClaim', $expenseClaimAlias);
        $queryBuilder->leftJoin($expenseClaimAlias . '.accountingDocuments', $expenseClaimDocumentAlias);

        $queryBuilder->groupBy($alias . '.id');

        $totalDocuments = 'COUNT(' . $transactionDocumentAlias . '.id)+COUNT(' . $expenseClaimDocumentAlias . '.id)';
        $queryBuilder->having($totalDocuments . $condition);

        return null;
    }
}
