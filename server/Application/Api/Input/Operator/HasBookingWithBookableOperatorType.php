<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Bookable;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\ORM\Query\NativeIn;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class HasBookingWithBookableOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter users by the bookable they are renting',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::listOf(self::nonNull($this->types->getId(Bookable::class))),
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

        $not = $args['not'] ? ' NOT' : '';

        $bookingAlias = HasBookingCompletedOperatorType::useSharedJoinBooking($alias, $queryBuilder);

        // Users with bookings with the given bookable(s)
        if ($ids) {
            return NativeIn::dql($bookingAlias . '.id', 'SELECT id FROM booking WHERE owner_id IS NOT NULL AND booking.bookable_id ' . $not . ' IN (' . Utility::quoteArray($ids) . ')');
        }

        // Users with bookings with ANY bookable, or without ANY bookable (own equipment)
        return NativeIn::dql($bookingAlias . '.id', 'SELECT id FROM booking WHERE owner_id IS NOT NULL AND booking.bookable_id IS NOT NULL', !$args['not']);
    }
}
