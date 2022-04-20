<?php

declare(strict_types=1);

namespace Application\Service;

use Doctrine\ORM\EntityManager;
use Psr\Container\ContainerInterface;

class InvoicerFactory
{
    /**
     * Return a configured invoicer.
     */
    public function __invoke(ContainerInterface $container): Invoicer
    {
        $entityManager = $container->get(EntityManager::class);

        return new Invoicer($entityManager);
    }
}
