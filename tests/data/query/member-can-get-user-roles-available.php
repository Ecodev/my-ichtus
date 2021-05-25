<?php

declare(strict_types=1);

use Application\Model\User;

return [
    [
        'query' => '{
               newUser: userRolesAvailable(user: null)
               member: userRolesAvailable(user: 1002)
               administrator: userRolesAvailable(user: 1000)
        }',
    ],
    [
        'data' => [
            'newUser' => [
                User::ROLE_ACCOUNTING_VERIFICATOR,
                User::ROLE_INDIVIDUAL,
                User::ROLE_MEMBER,
            ],
            'member' => [
                User::ROLE_ACCOUNTING_VERIFICATOR,
                User::ROLE_INDIVIDUAL,
                User::ROLE_MEMBER,
            ],
            'administrator' => [
                User::ROLE_ADMINISTRATOR,
            ],
        ],
    ],
];
