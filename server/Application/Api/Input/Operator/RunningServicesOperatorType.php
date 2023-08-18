<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\BookingTypeType;
use Application\Model\User;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\ORM\Query\NativeIn;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class RunningServicesOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the bookings that are currently running for a given user',
            'fields' => [
                [
                    'name' => 'user',
                    'type' => self::nonNull($this->types->getId(User::class)),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        if (!$args) {
            return null;
        }

        $connection = _em()->getConnection();
        $user = $connection->quote($args['user']->getId());
        $status = Utility::quoteArray([BookingStatusType::BOOKED, BookingStatusType::PROCESSED]);
        $bookingTypes = Utility::quoteArray([BookingTypeType::ADMIN_ASSIGNED, BookingTypeType::MANDATORY]);
        $courses = Utility::quoteArray([BookingTypeType::ADMIN_APPROVED]);

        $sql = <<<SQL
            SELECT booking.id FROM booking
            INNER JOIN bookable ON booking.bookable_id = bookable.id
            WHERE
                booking.owner_id = $user
                AND booking.status IN ($status)
                AND booking.end_date IS NULL
                AND
                (
                    bookable.booking_type IN ($bookingTypes)
                    OR
                    (bookable.booking_type IN ($courses) AND bookable.is_active)
                )
            SQL;

        return NativeIn::dql($alias . '.id', $sql);
    }
}
