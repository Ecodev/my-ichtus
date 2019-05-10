<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            leaveFamily(id: 1007) {
                id
            }
        }',
    ],
    [
        'data' => [
            'leaveFamily' => [
                'id' => 1007,
            ],
        ],
    ],
];
