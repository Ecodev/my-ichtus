<?php

declare(strict_types=1);

namespace Application\Log;

use Application\Model\Log;
use Doctrine\ORM\EntityManager;
use Interop\Container\ContainerInterface;
use Laminas\Log\Logger;
use Laminas\Log\Writer\Stream;
use Laminas\ServiceManager\Factory\FactoryInterface;

class LoggerFactory implements FactoryInterface
{
    /**
     * @var null|Logger
     */
    private $logger;

    /**
     * @param ContainerInterface $container
     * @param string $requestedName
     * @param null|array $options
     *
     * @return Logger
     */
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        if (!$this->logger) {
            // Log to file
            $this->logger = new Logger();
            $fileWriter = new Stream('logs/all.log');
            $this->logger->addWriter($fileWriter);

            $logRepository = $container->get(EntityManager::class)->getRepository(Log::class);
            $config = $container->get('config');
            $baseUrl = 'https://' . $config['hostname'];

            $dbWriter = new DbWriter($logRepository, $baseUrl);
            $dbWriter->addFilter(Logger::INFO);
            $this->logger->addWriter($dbWriter);
        }

        return $this->logger;
    }
}
