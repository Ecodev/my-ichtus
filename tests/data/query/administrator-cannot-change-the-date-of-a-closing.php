<?php

declare(strict_types=1);

return [
    [
        // Transaction 8005 is the accounting closing, whose date decides which transactions are read-only
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!) {
            updateTransaction(id: 8005, input: $inputTransaction) {
                remarks
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'transactionDate' => '2019-02-05',
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'Cannot modify the date of an accounting closing',
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
                    'updateTransaction',
                ],
            ],
        ],
    ],
];
