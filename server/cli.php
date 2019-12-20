<?php

declare(strict_types=1);

use Application\ORM\Query\Filter\AclFilter;
use Doctrine\ORM\EntityManager;

require_once 'vendor/autoload.php';
$container = require 'config/container.php';

/** @var EntityManager $entityManager */
$entityManager = $container->get(EntityManager::class);

// Disable all ACL filters to be able to access anything
/** @var AclFilter $aclFilter */
$aclFilter = $entityManager->getFilters()->getFilter(AclFilter::class);
$aclFilter->disableForever();

return $container;
