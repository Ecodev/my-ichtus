<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Enum\ExpenseClaimStatus;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class ExpenseClaimToReviewOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter expense claims have not been processed neither reviewed',
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::boolean(),
                    'defaultValue' => null,
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        $statusParam = $uniqueNameFactory->createParameterName();
        $queryBuilder->setParameter($statusParam, ExpenseClaimStatus::New->value);

        return $alias . '.reviewer IS NULL AND ' . $alias . '.status = :' . $statusParam;
    }
}
