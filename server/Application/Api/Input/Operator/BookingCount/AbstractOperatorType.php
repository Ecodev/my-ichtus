<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookingCount;

use Application\DBAL\Types\BookingTypeType;
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
            'description' => 'Filter the users by number of self-approved bookings',
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::nonNull(self::int()),
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
        $bookingType = $uniqueNameFactory->createParameterName();

        $queryBuilder->leftJoin($alias . '.bookings', $bookingAlias);
        $queryBuilder->leftJoin($bookingAlias . '.bookable', $bookableAlias);

        $groupBy = @$queryBuilder->getDQLPart('groupBy')[0];

        if (!$groupBy || !($groupBy->getParts()[0] === $alias . '.id')) {
            $queryBuilder->groupBy($alias . '.id');
        }

        $queryBuilder->having('COUNT(' . $bookingAlias . '.id) ' . $this->getDqlOperator() . ' :' . $param);

        $count = $args['value'];
        $queryBuilder->setParameter($param, $count);
        $queryBuilder->setParameter($bookingType, BookingTypeType::SELF_APPROVED);

        return $bookableAlias . ".bookingType = :$bookingType'";
    }
}
