<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            requestPasswordReset(login: "non-existing-user-login")
        }',
    ],
    [
        'data' => [
            'requestPasswordReset' => false,
        ],
    ],
];
