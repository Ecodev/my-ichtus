<?php

declare(strict_types=1);
$args = require 'trainer-can-update-bookable-but-only-remarks.php';

return [
    // Exact same query, but different bookable
    [
        'query' => $args[0]['query'],
        'variables' => [
            'id' => 3000,
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'User "trainer" with role trainer is not allowed on resource "Bookable#3000" with privilege "update" because the booking type for this bookable is not admin assigned, but : self_approved',
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
                    'updateBookable',
                ],
            ],
        ],

    ],
];
