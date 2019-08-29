<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionTag;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class TransactionExportOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Add joins and extra fields to transaction lines query for Excel export',
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::boolean(),
                    'defaultValue' => null,
                    'description' => 'This field is never used and can be ignored',
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        $transactionAlias = $uniqueNameFactory->createAliasName(Transaction::class);
        $tagAlias = $uniqueNameFactory->createAliasName(TransactionTag::class);
        $debitAlias = $uniqueNameFactory->createAliasName(Account::class);
        $creditAlias = $uniqueNameFactory->createAliasName(Account::class);

        $queryBuilder->innerJoin($alias . '.transaction', $transactionAlias);
        $queryBuilder->leftJoin($alias . '.transactionTag', $tagAlias);
        $queryBuilder->leftJoin($alias . '.debit', $debitAlias);
        $queryBuilder->leftJoin($alias . '.credit', $creditAlias);
        $queryBuilder->addSelect($transactionAlias);
        $queryBuilder->addSelect($tagAlias);
        $queryBuilder->addSelect($debitAlias);
        $queryBuilder->addSelect($creditAlias);

        return null;
    }
}
