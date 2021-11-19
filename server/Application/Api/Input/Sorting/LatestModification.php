<?php

declare(strict_types=1);

namespace Application\Api\Input\Sorting;

use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Doctrine\Sorting\SortingInterface;

/**
 * Sort items by their latest modification date.
 */
class LatestModification implements SortingInterface
{
    public function __construct()
    {
    }

    public function __invoke(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $order): void
    {
        $create = $alias . '.creationDate';
        $update = $alias . '.updateDate';
        $latestDate = "IF($create IS NULL, $update, IF($update IS NULL, $create, GREATEST($create, $update)))";

        $queryBuilder->addOrderBy($latestDate, $order);
    }
}
