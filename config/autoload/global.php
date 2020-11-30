<?php

declare(strict_types=1);

/**
 * Default configuration that can be overridden by a local.php, but it at least ensure
 * that required keys exist with "safe" values.
 */
return [
    'hostname' => 'my-ichtus.lan',
    'email' => [
        'from' => 'noreply@my-ichtus.lan',
        'toOverride' => null,
    ],
    'smtp' => null,
    'phpPath' => '/usr/bin/php7.4',
    'doorsApi' => [
        'endpoint' => 'http://localhost:8888',
        'token' => 'my-token-value',
    ],
    'templates' => [
        'paths' => [
            'app' => ['server/templates/app'],
            'error' => ['server/templates/error'],
            'layout' => ['server/templates/layout'],
        ],
    ],
];
