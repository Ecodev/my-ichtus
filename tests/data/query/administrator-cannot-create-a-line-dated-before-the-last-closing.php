<?php

declare(strict_types=1);

return [
    [
        // The transaction itself is dated after the closing of 2019-02-04, only its line reaches
        // back into the closed period
        'query' => 'mutation ($inputTransaction: TransactionInput!, $lines: [TransactionLineInput!]!) {
            createTransaction(input: $inputTransaction, lines: $lines) {
                name
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Achat de printemps',
                'transactionDate' => '2019-03-01',
            ],
            'lines' => [
                [
                    'name' => 'Achat de printemps',
                    'balance' => '150.00',
                    'transactionDate' => '2019-01-15',
                    'credit' => 10025,
                    'debit' => 10034,
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
                    'createTransaction',
                ],
            ],
        ],
    ],
];
