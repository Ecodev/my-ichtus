<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\AbstractModel;
use Application\Model\User;
use Application\ORM\Query\Filter\AclFilter;
use Doctrine\ORM\EntityRepository;

/**
 * Class AbstractRepository
 *
 * @method null|AbstractModel findOneById(integer $id)
 */
abstract class AbstractRepository extends EntityRepository
{
    /**
     * Returns the AclFilter to fetch ACL filtering SQL
     *
     * @return AclFilter
     */
    public function getAclFilter(): AclFilter
    {
        return $this->getEntityManager()->getFilters()->getFilter(AclFilter::class);
    }

    /**
     * Return native SQL query to get all ID
     *
     * @return string
     */
    protected function getAllIdsQuery(): string
    {
        $connection = $this->getEntityManager()->getConnection();
        $qb = $connection->createQueryBuilder()
            ->select('id')
            ->from($connection->quoteIdentifier($this->getClassMetadata()->getTableName()));

        return $qb->getSQL();
    }

    /**
     * Return native SQL query to get all ID of object owned by given user
     *
     * @param User $user
     *
     * @return string
     */
    protected function getAllIdsForOwnerQuery(User $user): string
    {
        $connection = $this->getEntityManager()->getConnection();
        $qb = $connection->createQueryBuilder()
            ->select('id')
            ->from($connection->quoteIdentifier($this->getClassMetadata()->getTableName()))
            ->andWhere('owner_id = ' . $user->getId());

        return $qb->getSQL();
    }
}
