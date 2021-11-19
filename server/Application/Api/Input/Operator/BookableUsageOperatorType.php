<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Booking;
use Application\Model\User;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\EntityID;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class BookableUsageOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the bookables currently rented by an user',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::getNullableType(self::listOf(self::nonNull($this->types->getId(User::class)))),
                    'defaultValue' => [],
                ],
                [
                    'name' => 'not',
                    'type' => self::boolean(),
                    'defaultValue' => false,
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        if (!$args) {
            return null;
        }

        $ids = array_map(fn (EntityID $id) => $id->getId(), $args['values']);

        $bookingAlias = $uniqueNameFactory->createAliasName(Booking::class);
        $param = $uniqueNameFactory->createParameterName();

        if (!$args['not'] && empty($ids)) {
            $queryBuilder->leftJoin($alias . '.bookings', $bookingAlias, Join::WITH, $bookingAlias . '.endDate IS NULL');

            return $bookingAlias . '.id IS NULL';
        }

        $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias);

        // Bookables currently rented by ANY user
        if ($args['not'] && empty($ids)) {
            return $bookingAlias . '.owner IS NOT NULL AND ' . $bookingAlias . '.endDate IS NULL';
        }

        // Bookables currently rented by an unknown user ?
        if (empty($ids)) {
            return $bookingAlias . '.owner IS NULL';
        }

        $queryBuilder->setParameter($param, $ids);

        $not = $args['not'] ? ' NOT' : '';

        // Bookables (NOT) currently rented by the given user(s)
        return $bookingAlias . '.owner' . $not . ' IN (:' . $param . ') AND ' . $bookingAlias . '.endDate IS NULL';
    }
}
