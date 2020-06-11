<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\EntityID;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class HasBookingWithBookableOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the users by the kind of bookable they are currently renting',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::nonNull(self::listOf(self::nonNull($this->types->getId(Bookable::class)))),
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
        $param = $uniqueNameFactory->createParameterName();

        $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias);
        $queryBuilder->innerJoin($bookingAlias . '.bookable', $bookableAlias);

        $queryBuilder->setParameter($param, $ids);

        return $bookableAlias . '.id IN (:' . $param . ') AND ' . $bookingAlias . '.endDate IS NULL';
    }
}
