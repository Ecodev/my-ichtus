<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Account;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class CreditOrDebitAccountOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter transaction lines affecting the given accounts in debit OR credit',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::getNullableType(self::listOf(self::nonNull($this->types->getId(Account::class)))),
                    'defaultValue' => [],
                ],
                [
                    'name' => 'not',
                    'type' => self::boolean(),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        if (!$args) {
            return null;
        }

        $ids = Utility::modelToId($args['values']);

        if ($ids === null) {
            return null;
        }

        // Lines not affecting any account (should not exist)
        if (array_key_exists('not', $args) && $args['not'] === false) {
            return $alias . '.debit IS NULL AND ' . $alias . '.credit IS NULL';
        }

        // Lines affecting ANY account
        if (array_key_exists('not', $args) && $args['not'] === true && empty($ids)) {
            return $alias . '.debit IS NOT NULL OR ' . $alias . '.credit IS NOT NULL';
        }

        $parameterName = $uniqueNameFactory->createParameterName();

        if (empty($ids)) {
            $ids = [-1];
        }

        $queryBuilder->setParameter($parameterName, $ids);

        // Lines NOT affecting any of those accounts
        if ($args['not'] === true) {
            return $alias . '.debit NOT IN (:' . $parameterName . ') AND ' . $alias . '.credit NOT IN (:' . $parameterName . ')';
        }

        // Lines affecting one of those accounts (debit OR credit)
        return $alias . '.debit IN (:' . $parameterName . ') OR ' . $alias . '.credit IN (:' . $parameterName . ')';
    }
}
