<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\BookableTag;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
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
        $tagAlias = $uniqueNameFactory->createAliasName(BookableTag::class);

        $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias, Join::WITH, $bookingAlias . '.endDate IS NULL');
        $queryBuilder->innerJoin($bookingAlias . '.bookable', $bookableAlias);

        // Bookings for bookables WITHOUT any tag
        if (!$args['not'] && empty($ids)) {
            $queryBuilder->leftJoin($bookableAlias . '.bookableTags', $tagAlias);

            return $tagAlias . '.id IS NULL';
        }

        $queryBuilder->innerJoin($bookableAlias . '.bookableTags', $tagAlias);

        // Bookings for bookables with ANY tag
        if ($args['not'] && empty($ids)) {
            return $tagAlias . '.id IS NOT NULL';
        }

        // Bookings for bookables with the given tag(s)
        $param = $uniqueNameFactory->createParameterName();
        $queryBuilder->setParameter($param, $ids);
        $not = $args['not'] ? ' NOT' : '';

        return $tagAlias . '.id' . $not . ' IN (:' . $param . ')';
    }
}
