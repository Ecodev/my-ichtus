<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookingDate;

use Application\Model\Bookable;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

abstract class AbstractOperatorType extends AbstractOperator
{
    abstract protected function getDqlOperator(): string;

    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the users who made at least one self-approved booking until/at/from a date',
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::nonNull(_types()->get('Date')),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        if (!$args) {
            return null;
        }

        $bookingAlias = $uniqueNameFactory->createAliasName(Booking::class);
        $bookableAlias = $uniqueNameFactory->createAliasName(Bookable::class);

        $param = $uniqueNameFactory->createParameterName();

        $queryBuilder->leftJoin($alias . '.bookings', $bookingAlias);
        $queryBuilder->leftJoin($bookingAlias . '.bookable', $bookableAlias);

        $queryBuilder->groupBy($alias . '.id');

        $date = $args['value'];
        $queryBuilder->setParameter($param, $date);

        return $bookableAlias . ".bookingType = 'self_approved' AND " . $bookingAlias . '.creationDate ' . $this->getDqlOperator() . ':' . $param;
    }
}
