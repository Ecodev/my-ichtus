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
                'totalParticipantCount' => 20,
                'totalInitialPrice' => '480.00',
                'totalPeriodicPrice' => '330.00',
            ],
        ],
    ],
];
