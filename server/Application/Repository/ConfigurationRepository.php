<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\Configuration;

/**
 * @extends AbstractRepository<Configuration>
 */
class ConfigurationRepository extends AbstractRepository
{
    /**
     * Get or create the configuration for the given key.
     */
    public function getOrCreate(string $key): Configuration
    {
        $configuration = $this->findOneByKey($key);
        if (!$configuration) {
            $configuration = new Configuration($key);
            $this->getEntityManager()->persist($configuration);
        }

        return $configuration;
    }
}
