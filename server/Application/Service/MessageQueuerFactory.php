<?php

declare(strict_types=1);

namespace Application\Service;

use Doctrine\ORM\EntityManager;
use Interop\Container\ContainerInterface;
use Laminas\View\Renderer\RendererInterface;

class MessageQueuerFactory
{
    /**
     * Return a configured mailer
     *
     * @param ContainerInterface $container
     *
     * @return MessageQueuer
     */
    public function __invoke(ContainerInterface $container): MessageQueuer
    {
        $entityManager = $container->get(EntityManager::class);
        $renderer = $container->get(RendererInterface::class);
        $config = $container->get('config');

        return new MessageQueuer(
            $entityManager,
            $renderer,
            $config['hostname']
        );
    }
}
