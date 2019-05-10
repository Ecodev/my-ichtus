<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputUser: UserPartialInput!) {
            updateUser(id: 1000 input: $inputUser) {
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
        'errors' => [
            [
                'message' => 'User "individual" with role individual is not allowed on resource "User#1000" with privilege "update"',
                'extensions' => [
                    'category' => 'Permissions',
                ],
                'locations' => [
                    [
                        'line' => 2,
                        'column' => 13,
                    ],
                ],
                'path' => [
                    'updateUser',
                ],
            ],
        ],
    ],
];
