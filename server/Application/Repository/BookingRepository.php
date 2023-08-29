<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\BookingTypeType;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\User;
use Cake\Chronos\ChronosDate;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\Query\ResultSetMappingBuilder;

/**
 * @extends AbstractRepository<Booking>
 */
class BookingRepository extends AbstractRepository
{
    /**
     * All non-terminated bookings
     *     for active, periodic bookable
     *     for non-archived user
     *     but that do not already have an existing transaction_line in the user account for this year.
     *
     * @param null|User $user if given will filter only for that user
     *
     * @return Booking[]
     */
    public function getAllToInvoice(?User $user = null): array
    {
        $rsm = new ResultSetMappingBuilder($this->getEntityManager(), ResultSetMappingBuilder::COLUMN_RENAMING_INCREMENT);
        $rsm->addRootEntityFromClassMetadata(Booking::class, 'booking');
        $rsm->addJoinedEntityFromClassMetadata(Bookable::class, 'bookable', 'booking', 'bookable');
        $selectClause = $rsm->generateSelectClause();

        $userFilter = $user ? 'AND user.id = :user' : '';

        $sql = "
            SELECT $selectClause FROM booking
            JOIN bookable ON booking.bookable_id = bookable.id
            JOIN user ON booking.owner_id = user.id AND user.role NOT IN (:roles)
            LEFT JOIN account ON user.id = account.owner_id
            LEFT JOIN transaction_line ON
                account.id = transaction_line.debit_id
                AND transaction_line.bookable_id = bookable.id
                AND transaction_line.transaction_date >= :currentYear
                AND transaction_line.transaction_date < :nextYear
            WHERE
            user.status != :userStatus
            $userFilter
            AND bookable.booking_type IN (:bookingType)
            AND booking.status = :bookingStatus
            AND booking.start_date < :nextYear
            AND (booking.end_date IS NULL OR booking.end_date >= :nextYear)
            AND bookable.is_active
            AND bookable.periodic_price != 0
            AND transaction_line.id IS NULL
            ORDER BY booking.owner_id ASC, bookable.name ASC
        ";

        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm)
            ->setParameter('bookingType', [BookingTypeType::MANDATORY, BookingTypeType::ADMIN_ASSIGNED, BookingTypeType::ADMIN_APPROVED], ArrayParameterType::STRING)
            ->setParameter('bookingStatus', BookingStatusType::BOOKED)
            ->setParameter('userStatus', User::STATUS_ARCHIVED)
            ->setParameter('currentYear', ChronosDate::now()->firstOfYear()->toDateString())
            ->setParameter('nextYear', ChronosDate::now()->firstOfYear()->addYears(1)->toDateString())
            ->setParameter('roles', [User::ROLE_BOOKING_ONLY], ArrayParameterType::STRING);

        if ($user) {
            $query->setParameter('user', $user->getId());
        }

        $result = $query->getResult();

        return $result;
    }
}
