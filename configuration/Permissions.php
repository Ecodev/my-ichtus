<?php

declare(strict_types=1);

return [
    [
        'path' => 'data/accounting',
        'permissions' => '0770',
        'recursive' => false,
    ],
    [
        'path' => 'data/images',
        'permissions' => '0770',
        'recursive' => false,
    ],
    [
        'path' => 'logs',
        'permissions' => '0770',
        'recursive' => true,
    ],
    [
        'path' => 'data/cache',
        'permissions' => '0770',
        'recursive' => true,
    ],
    [
        'path' => 'data/tmp',
        'permissions' => '0770',
        'recursive' => true,
    ],
    [
        'path' => 'data/session',
        'owner' => $webserver,
        'permissions' => '0770',
        'recursive' => true,
    ],
    [
        'path' => 'bin/build.sh',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/check-files.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/create-invoices.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/create-triggers.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/send-all-messages.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/delete-old-log.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/dump-data.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/dump-schema',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/graphql.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/load-data.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/load-remote-data.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/load-test-data.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/pre-commit.sh',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/check-accounting.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/close-accounting.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/queue-message-for-all-balance.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/queue-message-for-negative-balance.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'bin/send-message.php',
        'permissions' => '0750',
    ],
    [
        'path' => 'node_modules/.bin/*',
        'permissions' => '0750',
    ],
];
