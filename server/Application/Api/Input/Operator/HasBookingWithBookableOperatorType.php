<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class HasBookingWithBookableOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the users by the bookable they are currently renting',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::getNullableType(self::listOf(self::nonNull($this->types->getId(Bookable::class)))),
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

        $ids = Utility::modelToId($args['values']);

        $bookingAlias = $uniqueNameFactory->createAliasName(Booking::class);
        $bookableAlias = $uniqueNameFactory->createAliasName(Bookable::class);

        $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias, Join::WITH, $bookingAlias . '.endDate IS NULL');

        // Bookings without any bookable (own equipment)
        if (!$args['not'] && empty($ids)) {
            $queryBuilder->leftJoin($bookingAlias . '.bookable', $bookableAlias);

            return $bookableAlias . '.id IS NULL';
        }

        $queryBuilder->innerJoin($bookingAlias . '.bookable', $bookableAlias);

        // Bookings for ANY bookable
        if ($args['not'] && empty($ids)) {
            return $bookableAlias . '.id IS NOT NULL';
        }

        // Users with active bookings for the given bookable(s)
        $param = $uniqueNameFactory->createParameterName();
        $queryBuilder->setParameter($param, $ids);
        $not = $args['not'] ? ' NOT' : '';

        return $bookableAlias . '.id' . $not . ' IN (:' . $param . ')';
    }
}
