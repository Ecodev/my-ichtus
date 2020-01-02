<?php

declare(strict_types=1);

namespace Application\Service;

use Doctrine\ORM\EntityManager;
use Interop\Container\ContainerInterface;
use Laminas\Mail\Transport\TransportInterface;

class MailerFactory
{
    /**
     * Return a configured mailer
     *
     * @param ContainerInterface $container
     *
     * @return Mailer
     */
    public function __invoke(ContainerInterface $container): Mailer
    {
        $entityManager = $container->get(EntityManager::class);
        $transport = $container->get(TransportInterface::class);
        $config = $container->get('config');

        return new Mailer(
            $entityManager,
            $transport,
            $config['emailOverride'] ?? null,
            $config['fromEmail'],
            $config['phpPath']
        );
    }
}
