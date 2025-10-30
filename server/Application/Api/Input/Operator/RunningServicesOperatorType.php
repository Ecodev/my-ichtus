<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
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
                [
                    'name' => 'coursesOnly',
                    'type' => self::boolean(),
                    'defaultValue' => false,
                    'description' => 'Filter only courses',
                ],
                [
                    'name' => 'excludeNFT',
                    'type' => self::boolean(),
                    'defaultValue' => false,
                    'description' => 'Exclude bookables linked to BookableTag NFT',
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        $connection = _em()->getConnection();
        $user = $connection->quote($args['user']->getId());
        $status = Utility::quoteArray([BookingStatus::Booked->value, BookingStatus::Processed->value]);
        $bookingTypes = $args['coursesOnly'] ? '-1' : Utility::quoteArray([BookingType::AdminAssigned->value, BookingType::Mandatory->value]);
        $courses = Utility::quoteArray([BookingType::AdminApproved->value]);

        $excludeNFTJoin = '';
        $excludeNFTCondition = '';
        if ($args['excludeNFT']) {
            $excludeNFTJoin = 'LEFT JOIN bookable_tag_bookable ON bookable.id = bookable_tag_bookable.bookable_id AND bookable_tag_bookable.bookable_tag_id = 6042';
            $excludeNFTCondition = 'AND bookable_tag_bookable.bookable_id IS NULL';
        }

        $sql = <<<SQL
            SELECT booking.id FROM booking
            INNER JOIN bookable ON booking.bookable_id = bookable.id
            $excludeNFTJoin
            WHERE
                booking.owner_id = $user
                AND booking.status IN ($status)
                AND booking.end_date IS NULL
                $excludeNFTCondition
                AND
                (
                    bookable.booking_type IN ($bookingTypes)
                    OR
                    (bookable.booking_type IN ($courses) AND bookable.status = 'active')
                )
            SQL;

        return NativeIn::dql($alias . '.id', $sql);
    }
}
