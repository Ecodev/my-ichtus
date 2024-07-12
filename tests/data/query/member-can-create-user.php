<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputUser: UserInput!) {
            createUser(input: $inputUser) {
                login
                email
                status
                owner {
                    id
                }
            }
        }',
        'variables' => [
            'inputUser' => [
                'login' => 'jdoe',
                'firstName' => 'John',
                'lastName' => 'Doe',
                'email' => 'test@example.com',
                'owner' => '1002',
            ],
        ],
    ],
    [
        'data' => [
            'createUser' => [
                'login' => 'jdoe',
                'email' => 'test@example.com',
                'status' => 'Active',
                'owner' => [
                    'id' => '1002',
                ],
            ],
        ],
    ],
];
