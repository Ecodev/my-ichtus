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
                }
                bookable {
                    id
                }
            }
        }',
        'variables' => [
            'inputBooking' => [
                'startDate' => Chronos::now()->subMinute(1)->toIso8601String(),
                'bookable' => 3007,
                'status' => 'booked',
            ],
        ],
    ],
    [
        'data' => [
            'createBooking' => [
                'creator' => [
                    'id' => '1003',
                ],
                'bookable' => [
                    'id' => '3007',
                ],
            ],
        ],
    ],
];
