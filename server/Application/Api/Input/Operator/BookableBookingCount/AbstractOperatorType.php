<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookableBookingCount;

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
            'description' => 'Filter the bookables by number of simultaneous bookings',
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::nonNull(self::int()),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        $param = $uniqueNameFactory->createParameterName();

        $count = $args['value'];
        $queryBuilder->setParameter($param, $count);

        $bookingAlias = $uniqueNameFactory->createAliasName(Booking::class);

        $bookingClass = Booking::class;
        $dqlOperator = $this->getDqlOperator();

        return <<<STRING
                        EXISTS (
                            SELECT $bookingAlias.id FROM $bookingClass $bookingAlias
                            WHERE $bookingAlias.bookable = $alias.id AND $bookingAlias.endDate IS NULL
                            HAVING COUNT($bookingAlias.id) $dqlOperator :$param
                        )
            STRING;
    }
}
