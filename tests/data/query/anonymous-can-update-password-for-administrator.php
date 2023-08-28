<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            updatePassword(password: "douzecaracteres", token: "09876543210987654321098765432109")
        }',
    ],
    [
        'data' => [
            'updatePassword' => true,
        ],
    ],
    function (Doctrine\DBAL\Connection $connection): void {
        // create a valid token for right now
        $connection->update(
            'user',
            [
                'token' => '09876543210987654321098765432109',
                'token_creation_date' => \Cake\Chronos\Chronos::now()->subMinutes(1)->toIso8601String(),
            ],
            [
                'login' => 'administrator',
            ]
        );
    },
];
