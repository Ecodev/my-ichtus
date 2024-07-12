<?php

declare(strict_types=1);

use Cake\Chronos\Chronos;

return [
    [
        'query' => 'mutation ($inputBooking: BookingInput!) {
            createBooking(input: $inputBooking) {
                id
                creator {
                    id
                    name
                }
                bookable {
                    id
                }
            }
        }',
        'variables' => [
            'inputBooking' => [
                'startDate' => Chronos::now()->subMinutes(1)->toIso8601String(),
                'bookable' => 3007,
                'status' => 'Booked',
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'User "member" with role member is not allowed on resource "Booking#null" with privilege "create" because the user does not have the required license: Voile - niveau 1',
                'extensions' => [
                    'showSnack' => true,
                ],
                'locations' => [
                    [
                        'line' => 2,
                        'column' => 13,
                    ],
                ],
                'path' => [
                    'createBooking',
                ],
            ],
        ],
    ],
];
