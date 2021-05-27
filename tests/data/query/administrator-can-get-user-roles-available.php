<?php

declare(strict_types=1);

use Application\Model\User;

$args = require 'member-can-get-user-roles-available.php';

return [
    $args[0], // Exact same query
    [
        'data' => [
            'newUser' => [
                User::ROLE_BOOKING_ONLY,
                User::ROLE_ACCOUNTING_VERIFICATOR,
                User::ROLE_INDIVIDUAL,
                User::ROLE_MEMBER,
                User::ROLE_TRAINER,
                User::ROLE_FORMATION_RESPONSIBLE,
                User::ROLE_RESPONSIBLE,
                User::ROLE_ADMINISTRATOR,

            ],
            'member' => [
                User::ROLE_BOOKING_ONLY,
                User::ROLE_ACCOUNTING_VERIFICATOR,
                User::ROLE_INDIVIDUAL,
                User::ROLE_MEMBER,
                User::ROLE_TRAINER,
                User::ROLE_FORMATION_RESPONSIBLE,
                User::ROLE_RESPONSIBLE,
                User::ROLE_ADMINISTRATOR,
            ],
            'administrator' => [
                User::ROLE_BOOKING_ONLY,
                User::ROLE_ACCOUNTING_VERIFICATOR,
                User::ROLE_INDIVIDUAL,
                User::ROLE_MEMBER,
                User::ROLE_TRAINER,
                User::ROLE_FORMATION_RESPONSIBLE,
                User::ROLE_RESPONSIBLE,
                User::ROLE_ADMINISTRATOR,
            ],
        ],
    ],
];
