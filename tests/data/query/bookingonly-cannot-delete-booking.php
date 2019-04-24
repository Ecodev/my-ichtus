<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            deleteBookings(ids: [4000])
        }',
    ],
    [
        'errors' => [
            [
                'message' => 'User "bookingonly" with role booking_only is not allowed on resource "Booking#4000" with privilege "delete"',
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
                    'deleteBookings',
                ],
            ],
        ],
    ],
];
