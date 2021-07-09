<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            deleteBookings(ids: [4019])
        }',
    ],
    [
        'data' => [
            'deleteBookings' => true,
        ],
    ],
];
