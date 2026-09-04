<?php

declare(strict_types=1);

return [
    [
        // Transaction 8000 is dated after the closing of 2019-02-04, so it may be updated, but its
        // line must not be pushed back into the closed period
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [UpdatableTransactionLineInput!]) {
            updateTransaction(id: 8000, input: $inputTransaction, lines: $lines) {
                name
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Inscription cours nautique Active Member',
            ],
            'lines' => [
                [
                    'id' => 14000,
                    'name' => 'Inscription cours nautique Active Member',
                    'balance' => '100.00',
                    'transactionDate' => '2019-01-15',
                    'debit' => 10096,
                    'credit' => 10037,
                ],
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'Cannot date a TransactionLine before the last accounting closing',
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
