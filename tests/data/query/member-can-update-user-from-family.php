<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputUser: UserPartialInput!) {
            updateUser(id: 1007 input: $inputUser) {
                id
                email
            }
        }',
        'variables' => [
            'inputUser' => [
                'email' => 'test@example.com',
            ],
        ],
    ],
    [
        'data' => [
            'updateUser' => [
                'id' => 1007,
                'email' => 'test@example.com',
            ],
        ],
    ],
];
