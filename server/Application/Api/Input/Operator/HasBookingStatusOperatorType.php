<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Enum\BookingStatus;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class HasBookingStatusOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter users by the status of their bookings',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::listOf(self::nonNull($this->types->get(BookingStatus::class))),
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

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        $bookingAlias = HasBookingCompletedOperatorType::useSharedJoinBooking($alias, $queryBuilder);

        if (!array_key_exists('values', $args) || empty($args['values'])) {
            $statuses = [-1];
        } else {
            $statuses = $args['values'];
        }

        $param = $uniqueNameFactory->createParameterName();
        $queryBuilder->setParameter($param, $statuses);
        $not = $args['not'] ? ' NOT' : '';

        return $bookingAlias . '.status' . $not . ' IN (:' . $param . ')';
    }
}
