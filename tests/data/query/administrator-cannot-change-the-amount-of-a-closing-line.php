<?php

declare(strict_types=1);

return [
    [
        // Transaction 8005 is the accounting closing, whose amounts must keep matching the closed period
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [UpdatableTransactionLineInput!]) {
            updateTransaction(id: 8005, input: $inputTransaction, lines: $lines) {
                remarks
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
                    'balance' => '11000.00',
                    'transactionDate' => '2019-02-04',
                    'debit' => 10034,
                ],
                [
                    'id' => 14006,
                    'name' => 'Paiement voilier par PostFinance',
                    'balance' => '7000.00',
                    'transactionDate' => '2019-02-04',
                    'credit' => 10025,
                ],
                [
                    'id' => 14007,
                    'name' => 'Paiement voilier par Raiffeisen',
                    'balance' => '3000.00',
                    'transactionDate' => '2019-02-04',
                    'credit' => 10026,
                ],
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'Cannot modify balance of a generated TransactionLine.',
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
