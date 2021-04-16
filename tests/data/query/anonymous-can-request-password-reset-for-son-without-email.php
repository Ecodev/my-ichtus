<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            requestPasswordReset(login: "son")
        }',
    ],
    [
        'data' => [
            'requestPasswordReset' => true,
        ],
    ],
];
