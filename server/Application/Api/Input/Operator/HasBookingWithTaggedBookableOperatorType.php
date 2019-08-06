<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\BookableTag;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\EntityID;
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
                    'type' => self::nonNull(self::listOf(self::nonNull($this->types->getId(BookableTag::class)))),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        if (!$args) {
            return null;
        }

        $ids = array_map(function (EntityID $id) {
            return $id->getId();
        }, $args['values']);

        $bookingAlias = $uniqueNameFactory->createAliasName(Booking::class);
        $bookableAlias = $uniqueNameFactory->createAliasName(Bookable::class);
        $tagAlias = $uniqueNameFactory->createAliasName(BookableTag::class);
        $param = $uniqueNameFactory->createParameterName();

        $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias);
        $queryBuilder->innerJoin($bookingAlias . '.bookable', $bookableAlias);
        $queryBuilder->innerJoin($bookableAlias . '.bookableTags', $tagAlias);

        if (empty($ids)) {
            return $tagAlias . '.id IS NULL';
        }

        $queryBuilder->setParameter($param, $ids);

        return $tagAlias . '.id IN (:' . $param . ') AND ' . $bookingAlias . '.endDate IS NULL';
    }
}
