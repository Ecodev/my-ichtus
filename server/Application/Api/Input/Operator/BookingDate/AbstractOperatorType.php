<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookingDate;

use Application\Enum\BookingType;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\Api\Scalar\DateType;
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
                    'type' => self::nonNull(_types()->get(DateType::class)),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        $bookingAlias = 'booking_count_date_alias';
        $bookableAlias = 'bookable_count_date_alias';
        $param = $uniqueNameFactory->createParameterName();

        if (!in_array($bookingAlias, $queryBuilder->getAllAliases(), true)) {
            $queryBuilder->innerJoin($alias . '.bookings', $bookingAlias);
        }

        if (!in_array($bookableAlias, $queryBuilder->getAllAliases(), true)) {
            $queryBuilder->innerJoin($bookingAlias . '.bookable', $bookableAlias);
        }

        $bookingType = $uniqueNameFactory->createParameterName();
        $groupBy = @$queryBuilder->getDQLPart('groupBy')[0];

        if (!$groupBy || !($groupBy->getParts()[0] === $alias . '.id')) {
            $queryBuilder->groupBy($alias . '.id');
        }

        $date = $args['value'];
        $queryBuilder->setParameter($param, $date);
        $queryBuilder->setParameter($bookingType, BookingType::SelfApproved->value);

        return $bookableAlias . ".bookingType = :$bookingType AND " . $bookingAlias . '.startDate ' . $this->getDqlOperator() . ':' . $param;
    }
}
