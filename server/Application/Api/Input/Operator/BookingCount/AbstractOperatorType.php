<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookingCount;

use Application\Enum\BookingType;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\ORM\Query\NativeIn;
use Ecodev\Felix\Utility;
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

        $count = $args['value'];
        $bookingTypes = Utility::quoteArray([BookingType::SelfApproved->value]);

        $operator = $this->getDqlOperator();
        $sql = <<<SQL
            SELECT booking.owner_id FROM booking
            INNER JOIN bookable ON booking.bookable_id = bookable.id
            WHERE
                booking.owner_id IS NOT NULL
                AND bookable.booking_type IN ($bookingTypes)
            GROUP BY booking.owner_id
            HAVING COUNT(bookable.id) $operator $count
            SQL;

        return NativeIn::dql($alias . '.id', $sql);
    }
}
