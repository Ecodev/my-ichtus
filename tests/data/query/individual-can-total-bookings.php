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
                'totalParticipantCount' => 18,
                'totalInitialPrice' => '240.00',
                'totalPeriodicPrice' => '330.00',
            ],
        ],
    ],
];
