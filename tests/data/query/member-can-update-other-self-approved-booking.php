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
            'id' => '4016',
        ],
    ],
    [
        'data' => [
            'terminateBooking' => [
                'id' => 4016,
            ],
        ],
    ],
];
