<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\DBAL\Types\BookingStatusType;
use Application\Model\BookableTag;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Expr;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class HasBookingWithTaggedBookableOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the users by the kind of bookable they are currently renting',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::getNullableType(self::listOf(self::nonNull($this->types->getId(BookableTag::class)))),
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

        $bookingAlias = 'hasbookingwithtaggedbookable_booking_alias';
        $bookableAlias = 'hasbookingwithtaggedbookable_bookable_alias';
        $tagAlias = 'hasbookingwithtaggedbookable_tag_alias';

        if (!in_array($bookingAlias, $queryBuilder->getAllAliases(), true)) {
            // Only consider running bookings that are not pending applications
            $bookingStatusParam = $uniqueNameFactory->createParameterName();
            $queryBuilder->setParameter($bookingStatusParam, [BookingStatusType::BOOKED]);
            $queryBuilder->innerJoin(
                $alias . '.bookings',
                $bookingAlias,
                Join::WITH,
                $bookingAlias . '.endDate IS NULL AND ' . $bookingAlias . '.status IN (:' . $bookingStatusParam . ')'
            );
        }

        if (!in_array($bookableAlias, $queryBuilder->getAllAliases(), true)) {
            $queryBuilder->innerJoin($bookingAlias . '.bookable', $bookableAlias);
        }

        // Bookings for bookables WITHOUT any tag
        if (array_key_exists('not', $args) && $args['not'] === false) {
            $queryBuilder->leftJoin($bookableAlias . '.bookableTags', $tagAlias);

            return $tagAlias . '.id IS NULL';
        }

        if (!in_array($tagAlias, $queryBuilder->getAllAliases(), true)) {
            $queryBuilder->innerJoin($bookableAlias . '.bookableTags', $tagAlias);
        }

        // Bookings for bookables with ANY tag
        if (array_key_exists('not', $args) && $args['not'] === true && empty($ids)) {
            return $tagAlias . '.id IS NOT NULL';
        }

        // Bookings for bookables with the given tag(s)
        $param = $uniqueNameFactory->createParameterName();
        $queryBuilder->setParameter($param, $ids);
        $not = array_key_exists('not', $args) && $args['not'] === true ? ' NOT' : '';

        return $tagAlias . '.id' . $not . ' IN (:' . $param . ')';
    }
}
