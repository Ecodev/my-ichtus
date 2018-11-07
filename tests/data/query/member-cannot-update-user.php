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
                'email' => 'test email',
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'User "member" with role member is not allowed on resource "User#1000" with privilege "update"',
                'category' => 'Permissions',
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
