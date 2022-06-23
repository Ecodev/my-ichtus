<?php

declare(strict_types=1);

use Application\Model\User;

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
                'status' => User::STATUS_ACTIVE,
                'owner' => [
                    'id' => '1002',
                ],
            ],
        ],
    ],
];
