<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionInput!, $lines: [TransactionLineInput!]!) {
            createTransaction(input: $inputTransaction, lines: $lines) {
                name
                balance
                transactionLines {
                    balance
                }
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'foo',
                'transactionDate' => '2019-02-04',
            ],
            'lines' => [
                [
                    'name' => 'line 1',
                    'balance' => '50.00',
                    'transactionDate' => '2019-02-03',
                ],
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'Cannot create a TransactionLine without any account',
                'extensions' => [
                    'category' => 'Permissions',
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
