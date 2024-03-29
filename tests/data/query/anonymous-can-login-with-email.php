<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            login(login: "administrator@example.com" password: "administrator") {
                id
                login
            }
        }',
    ],
    [
        'data' => [
            'login' => [
                'id' => '1000',
                'login' => 'administrator',
            ],
        ],
    ],
];
