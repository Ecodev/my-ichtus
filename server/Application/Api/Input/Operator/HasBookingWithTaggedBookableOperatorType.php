<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\BookableTag;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\ORM\Query\NativeIn;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class HasBookingWithTaggedBookableOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter users by the kind of bookable they are renting',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::listOf(self::nonNull($this->types->getId(BookableTag::class))),
                    'defaultValue' => [],
                ],
                [
                    'name' => 'not',
                    'type' => self::boolean(),
                    'defaultValue' => false,
                ],
                [
                    'name' => 'sameBooking',
                    'type' => self::boolean(),
                    'defaultValue' => true,
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        if ($args['sameBooking']) {
            $bookingAlias = HasBookingCompletedOperatorType::useSharedJoinBooking($alias, $queryBuilder);
        } else {
            $bookingAlias = $uniqueNameFactory->createAliasName(Booking::class);
            $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias);
        }

        $ids = Utility::modelToId($args['values']);

        // Users with bookings for bookables with, or without, the given tag(s)
        if ($ids) {
            $not = $args['not'] ? ' NOT' : '';

            return NativeIn::dql($bookingAlias . '.id', 'SELECT id FROM booking WHERE owner_id IS NOT NULL AND booking.bookable_id ' . $not . ' IN (SELECT bookable_tag_bookable.bookable_id FROM bookable_tag_bookable WHERE bookable_tag_bookable.bookable_tag_id IN (' . Utility::quoteArray($ids) . '))');
        }

        // Users with bookings for bookables with ANY tags, or without ANY tags
        $not = $args['not'] ? '' : ' NOT';

        return NativeIn::dql($bookingAlias . '.id', 'SELECT id FROM booking WHERE owner_id IS NOT NULL AND booking.bookable_id  ' . $not . '  IN (SELECT bookable_tag_bookable.bookable_id FROM bookable_tag_bookable)');
    }
}
