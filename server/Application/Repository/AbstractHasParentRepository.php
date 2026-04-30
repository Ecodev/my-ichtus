<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\AbstractModel;
use Application\Traits\HasParentInterface;
use Ecodev\Felix\Utility;

/**
 * @template T of HasParentInterface & AbstractModel
 *
 * @extends AbstractRepository<T>
 */
abstract class AbstractHasParentRepository extends AbstractRepository
{
    /**
     * Native query to return the IDs of myself and all recursive descendants
     * of the one passed as parameter.
     *
     * @param int[] $itemIds
     */
    protected function getSelfAndDescendantsSubQuery(array $itemIds): string
    {
        $table = $this->getClassMetadata()->table['name'];

        $connection = $this->getEntityManager()->getConnection();
        $table = $connection->quoteIdentifier($table);
        $quotedIds = Utility::quoteArray($itemIds);
        $entireHierarchySql = "
            WITH RECURSIVE parent AS (
                    SELECT $table.id, $table.parent_id FROM $table WHERE $table.id IN ($quotedIds)
                    UNION
                    SELECT $table.id, $table.parent_id FROM $table JOIN parent ON $table.parent_id = parent.id
                )
            SELECT id FROM parent ORDER BY id";

        return mb_trim($entireHierarchySql);
    }

    /**
     * Return the IDs of myself and all recursive descendants of the one passed as parameter.
     *
     * @param int[] $itemIds
     *
     * @return int[]
     */
    public function getSelfAndDescendants(array $itemIds): array
    {
        $connection = $this->getEntityManager()->getConnection();

        return $connection->fetchFirstColumn($this->getSelfAndDescendantsSubQuery($itemIds));
    }
}
