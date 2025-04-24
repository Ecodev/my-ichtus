<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class HasBookingCompletedOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter users that have completed their bookings',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::listOf(self::nonNull(self::boolean())),
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

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        $not = $args['not'];

        $bookingAlias = self::useSharedJoinBooking($alias, $queryBuilder);

        if (!array_key_exists('values', $args) || empty($args['values'])) {
            if ($not) {
                return '';
            }
            $condition = '';
        } elseif (in_array(true, $args['values'], true) && !in_array(false, $args['values'], true)) {
            $condition = $not ? '' : 'NOT';
        } elseif (in_array(false, $args['values'], true) && !in_array(true, $args['values'], true)) {
            $condition = $not ? 'NOT' : '';
        } else {
            return '';
        }

        return $bookingAlias . '.endDate IS ' . $condition . ' NULL';
    }

    public static function useSharedJoinBooking(string $alias, QueryBuilder $queryBuilder): string
    {
        $bookingAlias = 'users_bookings_alias';

        if (!in_array($bookingAlias, $queryBuilder->getAllAliases(), true)) {
            $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias);
        }

        return $bookingAlias;
    }
}
