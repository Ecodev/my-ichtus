<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [UpdatableTransactionLineInput!]) {
            updateTransaction(id: 8005, input: $inputTransaction, lines: $lines) {
                name
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Achat d\'un nouveau voilier',
            ],
            'lines' => [
                [
                    'id' => 14005,
                    'name' => 'Acquisition voilier NE123456',
                    'balance' => '10000.00',
                    'transactionDate' => '2019-02-04',
                    'debit' => 10034,
                ],
                // This line belongs to transaction 8000, so it cannot be stolen by this one
                [
                    'id' => 14000,
                    'name' => 'Paiement voilier par PostFinance',
                    'balance' => '10000.00',
                    'transactionDate' => '2019-02-04',
                    'credit' => 10025,
                ],
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'A TransactionLine can only be updated by the Transaction it belongs to',
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
