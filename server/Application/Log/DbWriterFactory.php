<?php

declare(strict_types=1);

namespace Application\Log;

use Application\Model\Log;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Log\DbWriter;
use Interop\Container\ContainerInterface;
use Laminas\ServiceManager\Factory\FactoryInterface;

class DbWriterFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        $logRepository = $container->get(EntityManager::class)->getRepository(Log::class);
        $config = $container->get('config');
        $baseUrl = 'https://' . $config['hostname'];

        return new DbWriter($logRepository, $baseUrl);
    }
}
