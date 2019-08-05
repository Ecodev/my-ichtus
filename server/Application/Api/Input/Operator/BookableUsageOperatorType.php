<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Booking;
use Application\Model\User;
use Doctrine\ORM\Mapping\ClassMetadata;
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
                    'type' => self::nonNull(self::listOf(self::nonNull($this->types->getId(User::class)))),
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
        $param = $uniqueNameFactory->createParameterName();

        $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias);

        if (empty($ids)) {
            return $bookingAlias . '.owner IS NULL';
        }

        $queryBuilder->setParameter($param, $ids);

        return $bookingAlias . '.owner IN (:' . $param . ') AND ' . $bookingAlias . '.endDate IS NULL';
    }
}
