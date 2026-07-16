<?php

declare(strict_types=1);

namespace Application\Api;

use Application\Acl\Acl;
use Application\Model\AbstractModel;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\TransactionLine;
use Application\Model\User;
use Cake\Chronos\Chronos;
use Cake\Chronos\ChronosDate;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Ecodev\Felix\Api\Exception;
use GraphQL\Doctrine\Definition\EntityID;

abstract class Helper
{
    public static function throwIfDenied(AbstractModel $model, string $privilege): void
    {
        $acl = new Acl();
        if (!$acl->isCurrentUserAllowed($model, $privilege)) {
            throw new Exception($acl->getLastDenialMessage() ?? '');
        }
    }

    /**
     * Refuse manually entered transaction dates in the future.
     *
     * Only applies to user input (create/update transaction mutations), because internal
     * usages
     */
    public static function throwIfFutureTransactionDate(?Chronos $transactionDate): void
    {
        if ($transactionDate && new ChronosDate($transactionDate)->greaterThan(ChronosDate::today())) {
            throw new Exception(_tr("La date d'écriture ne peut pas être dans le futur"));
        }
    }

    public static function paginate(array $pagination, QueryBuilder $query): array
    {
        $offset = max(0, $pagination['offset']);
        $pageIndex = max(0, $pagination['pageIndex']);
        $pageSize = max(0, $pagination['pageSize']);

        $paginator = new Paginator($query);
        $paginator
            ->getQuery()
            ->setFirstResult($offset ?: $pageSize * $pageIndex)
            ->setMaxResults($pageSize);

        $pagination['length'] = fn () => $paginator->count();
        $pagination['items'] = $paginator->getIterator();

        return $pagination;
    }

    public static function hydrate(AbstractModel $object, array $input): void
    {
        // Be sure to set owner last, so that it might propagate user status and discount
        if ($object instanceof User && array_key_exists('owner', $input)) {
            $owner = $input['owner'];
            unset($input['owner']);
            $input['owner'] = $owner;
        }

        foreach ($input as $name => $value) {
            if ($value instanceof EntityID) {
                $value = $value->getEntity();
            }

            $setter = 'set' . ucfirst($name);
            $object->$setter($value);
        }
    }

    /**
     * Returns aggregated fields (as scalar) for the given QueryBuilder.
     */
    public static function aggregatedFields(string $class, QueryBuilder $qb): array
    {
        $result = [];

        if ($class === Booking::class) {
            $qb->resetDQLPart('select')
                ->resetDQLPart('orderBy')
                ->addSelect('SUM(booking1.participantCount) AS totalParticipantCount')
                ->addSelect('SUM(bookable.periodicPrice) AS totalPeriodicPrice')
                ->addSelect('SUM(bookable.initialPrice) AS totalInitialPrice')
                ->leftJoin('booking1.bookable', 'bookable');

            $result = $qb->getQuery()->getResult()[0] ?? [
                'totalParticipantCount' => null,
                'totalPeriodicPrice' => null,
                'totalInitialPrice' => null,
            ];
        } elseif ($class === Bookable::class) {
            $qb->resetDQLPart('select')
                ->resetDQLPart('orderBy')
                ->addSelect('SUM(bookable1.purchasePrice) AS totalPurchasePrice')
                ->addSelect('SUM(bookable1.periodicPrice) AS totalPeriodicPrice')
                ->addSelect('SUM(bookable1.initialPrice) AS totalInitialPrice');

            $result = $qb->getQuery()->getResult()[0] ?? [
                'totalPurchasePrice' => null,
                'totalPeriodicPrice' => null,
                'totalInitialPrice' => null,
            ];
        } elseif ($class === TransactionLine::class) {
            $qb->resetDQLPart('select')
                ->resetDQLPart('orderBy')
                ->addSelect('SUM(transactionLine1.balance) AS totalBalance');

            $result = $qb->getQuery()->getResult()[0] ?? [
                'totalBalance' => null,
            ];
        }

        return $result;
    }
}
