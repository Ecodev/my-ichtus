<?php

declare(strict_types=1);

use Doctrine\ORM\EntityManager;
use GraphQL\Doctrine\Types;
use Laminas\Log\LoggerInterface;

/**
 * Returns the type registry
 *
 * @return Types
 */
function _types(): Types
{
    global $container;

    return $container->get(Types::class);
}

/**
 * Returns the EM
 *
 * @return EntityManager
 */
function _em(): EntityManager
{
    global $container;

    return $container->get(EntityManager::class);
}

/**
 * Returns logger
 *
 * @return LoggerInterface
 */
function _log(): LoggerInterface
{
    global $container;

    return $container->get(LoggerInterface::class);
}
