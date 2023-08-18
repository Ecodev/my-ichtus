<?php

declare(strict_types=1);

return [
    [
        'query' => '{
            bookings {
                totalParticipantCount
                totalInitialPrice
                totalPeriodicPrice
            }
        }',
    ],
    [
        'data' => [
            'bookings' => [
                'totalParticipantCount' => 21,
                'totalInitialPrice' => '600.00',
                'totalPeriodicPrice' => '330.00',
            ],
        ],
    ],
];
