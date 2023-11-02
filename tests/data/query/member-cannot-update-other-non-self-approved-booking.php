<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation TerminateBooking($id: BookingID!) {
            terminateBooking(id: $id) {
                id
            }
        }',
        'variables' => [
            'id' => '4017',
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'User "member" with role member is not allowed on resource "Booking#4017" with privilege "update" because:

- the booking type for this booking is not self approved, but : admin_assigned
- the object does not belong to the user',
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
                    'terminateBooking',
                ],
            ],
        ],
    ],
];
