<?php

declare(strict_types=1);

namespace Application\Service;

use Doctrine\ORM\EntityManager;
use Interop\Container\ContainerInterface;

class AccountingFactory
{
    /**
     * Return a configured accounting service
     */
    public function __invoke(ContainerInterface $container): Accounting
    {
        $entityManager = $container->get(EntityManager::class);

        return new Accounting($entityManager);
    }
}
