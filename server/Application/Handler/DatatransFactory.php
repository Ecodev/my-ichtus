<?php

declare(strict_types=1);

namespace Application\Handler;

use Doctrine\ORM\EntityManager;
use Mezzio\Template\TemplateRendererInterface;
use Psr\Container\ContainerInterface;

class DatatransFactory
{
    public function __invoke(ContainerInterface $container): DatatransHandler
    {
        $entityManager = $container->get(EntityManager::class);
        $rendered = $container->get(TemplateRendererInterface::class);
        $config = $container->get('config');

        return new DatatransHandler($entityManager, $rendered, $config);
    }
}
