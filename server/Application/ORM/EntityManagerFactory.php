<?php

declare(strict_types=1);

namespace Application\ORM;

use Doctrine\ORM\EntityManager;
use Ecodev\Felix\ORM\Query\Filter\AclFilter;
use Psr\Container\ContainerInterface;

class EntityManagerFactory
{
    /**
     * Return the preferred driver available on this system
     */
    public function __invoke(ContainerInterface $container): EntityManager
    {
        $factory = new \Roave\PsrContainerDoctrine\EntityManagerFactory();
        $entityManger = $factory($container);

        $entityManger->getFilters()->enable(AclFilter::class);

        return $entityManger;
    }
}
