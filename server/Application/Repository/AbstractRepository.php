<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\AbstractModel;
use Application\Model\User;
use Doctrine\ORM\EntityRepository;

/**
 * Class AbstractRepository
 *
 * @method null|AbstractModel findOneById(integer $id)
 */
abstract class AbstractRepository extends EntityRepository
{
    use \Ecodev\Felix\Repository\Traits\Repository;

    /**
     * Return native SQL query to get all ID of object owned by anybody from the family
     */
    protected function getAllIdsForFamilyQuery(User $user): string
    {
        if ($user->getOwner()) {
            $id = $user->getOwner()->getId();
        } else {
            $id = $user->getId();
        }

        $connection = $this->getEntityManager()->getConnection();
        $qb = $connection->createQueryBuilder()
            ->select('id')
            ->from($connection->quoteIdentifier($this->getClassMetadata()->getTableName()))
            ->andWhere('owner_id IN (SELECT id FROM user WHERE id = ' . $id . ' OR owner_id = ' . $id . ')');

        return $qb->getSQL();
    }
}
