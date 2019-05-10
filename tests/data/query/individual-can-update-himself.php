<?php

declare(strict_types=1);

use Application\Model\User;

return [
    [
        'query' => 'mutation ($inputUser: UserPartialInput!) {
            updateUser(id: 1007 input: $inputUser) {
                id
                name
                email
            }
        }',
        'variables' => [
            'inputUser' => [
                'firstName' => 'test',
                'lastName' => 'name',
                'email' => 'test@example.com',
                'role' => User::ROLE_INDIVIDUAL,
            ],
        ],
    ],
    [
        'data' => [
            'updateUser' => [
                'id' => 1007,
                'name' => 'test name',
                'email' => 'test@example.com',
            ],
        ],
    ],
];
