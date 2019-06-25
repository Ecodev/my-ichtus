<?php

declare(strict_types=1);

namespace Application\Api\Input\Sorting;

use Application\Model\User;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Doctrine\Sorting\SortingInterface;

/**
 * Sort users by their account's balance
 */
class Balance implements SortingInterface
{
    public function __construct()
    {
    }

    public function __invoke(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $order): void
    {
        $account = $uniqueNameFactory->createAliasName(User::class);
        $queryBuilder->leftJoin($alias . '.accounts', $account);

        $queryBuilder->addOrderBy($account . '.balance', $order);
    }
}
