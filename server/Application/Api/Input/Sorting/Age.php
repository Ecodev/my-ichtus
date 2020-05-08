<?php

declare(strict_types=1);

namespace Application\Api\Input\Sorting;

use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Doctrine\Sorting\SortingInterface;

/**
 * Sort by user's age
 */
class Age implements SortingInterface
{
    public function __construct()
    {
    }

    public function __invoke(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $order): void
    {
        $birthday = $alias . '.birthday';
        $queryBuilder->addOrderBy("DATE_DIFF(CURRENT_DATE(), $birthday)", $order);
    }
}
