<?php

declare(strict_types=1);

use Laminas\ServiceManager\ServiceManager;

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

return $container;
