<?php

declare(strict_types=1);

namespace Application\Service;

use Doctrine\ORM\EntityManager;
use Psr\Container\ContainerInterface;

class AccountingFactory
{
    /**
     * Return a configured accounting service.
     */
    public function __invoke(ContainerInterface $container): Accounting
    {
        $entityManager = $container->get(EntityManager::class);
        $config = $container->get('config');

        return new Accounting($entityManager, $config['accounting']);
    }
}
