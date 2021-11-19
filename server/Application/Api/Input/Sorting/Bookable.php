<?php

declare(strict_types=1);

namespace Application\Api\Input\Sorting;

use Application\Model\User;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Doctrine\Sorting\SortingInterface;

/**
 * Sort bookings by their bookable's name.
 */
class Bookable implements SortingInterface
{
    public function __construct()
    {
    }

    public function __invoke(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $order): void
    {
        $bookable = $uniqueNameFactory->createAliasName(User::class);
        $queryBuilder->leftJoin($alias . '.bookable', $bookable);

        $queryBuilder->addOrderBy($bookable . '.name', $order);
    }
}
