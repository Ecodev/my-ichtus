<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Bookable;
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

        $bookingAlias = 'hasbookingwithbookable_booking_alias';
        $bookableAlias = 'hasbookingwithbookable_bookable_alias';

        if (!in_array($bookingAlias, $queryBuilder->getAllAliases(), true)) {
            $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias, Join::WITH, $bookingAlias . '.endDate IS NULL');
        }

        // Bookings without any bookable (own equipment)
        if (array_key_exists('not', $args) && $args['not'] === false) {
            $queryBuilder->leftJoin($bookingAlias . '.bookable', $bookableAlias);

            return $bookableAlias . '.id IS NULL';
        }

        if (!in_array($bookableAlias, $queryBuilder->getAllAliases(), true)) {
            $queryBuilder->innerJoin($bookingAlias . '.bookable', $bookableAlias);
        }

        // Bookings for ANY bookable
        if (array_key_exists('not', $args) && $args['not'] === true && empty($ids)) {
            return $bookableAlias . '.id IS NOT NULL';
        }

        // Users with active bookings for the given bookable(s)
        $param = $uniqueNameFactory->createParameterName();
        $queryBuilder->setParameter($param, $ids);
        $not = array_key_exists('not', $args) && $args['not'] === true ? ' NOT' : '';

        return $bookableAlias . '.id' . $not . ' IN (:' . $param . ')';
    }
}
