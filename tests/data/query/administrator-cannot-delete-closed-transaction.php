<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            deleteTransactions(ids: [8007])
        }',
    ],
    [
        'errors' => [
            [
                'message' => 'User "administrator" with role administrator is not allowed on resource "Transaction#8007" with privilege "delete" because the transaction belongs to a closed accounting period',
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
                    'deleteTransactions',
                ],
            ],
        ],
    ],
];
