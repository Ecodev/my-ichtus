<?php

declare(strict_types=1);

use Doctrine\ORM\EntityManager;
use GraphQL\Doctrine\Types;
use Laminas\Log\LoggerInterface;
use Laminas\ServiceManager\ServiceManager;

require_once 'server/Debug.php';

// Secure cookie usage
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.save_path', dirname(__DIR__) . '/data/session');
ini_set('session.gc_maxlifetime', (string) (365 * 86400));

// Load configuration
$config = require __DIR__ . '/config.php';

$dependencies = $config['dependencies'];
$dependencies['services']['config'] = $config;

// Build container
global $container;
$container = new ServiceManager($dependencies);

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

return $container;
