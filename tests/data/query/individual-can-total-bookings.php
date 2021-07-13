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
                'totalParticipantCount' => 16,
                'totalInitialPrice' => '240.00',
                'totalPeriodicPrice' => '260.00',
            ],
        ],
    ],
];
