<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionInput!, $lines: [TransactionLineInput!]!) {
            createTransaction(input: $inputTransaction, lines: $lines) {
                name
                transactionLines {
                    balance
                    credit {
                        balance
                    }
                    debit {
                        balance
                    }
                }
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Le club achète un nouveau voilier',
                'transactionDate' => '2019-02-04',
            ],
            'lines' => [
                [
                    'name' => 'Acquisition voilier NE123456',
                    'balance' => '10000',
                    'transactionDate' => '2019-02-03',
                    'debit' => 10034,
                ],
                [
                    'name' => 'Paiement par PostFinance	',
                    'balance' => '7000',
                    'transactionDate' => '2019-02-03',
                    'credit' => 10025,
                ],
                [
                    'name' => 'Paiement par Raiffeisen',
                    'balance' => '3000',
                    'transactionDate' => '2019-02-04',
                    'credit' => 10026,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'createTransaction' => [
                'name' => 'Le club achète un nouveau voilier',
                'transactionLines' => [
                    [
                        'balance' => '10000.00',
                        'credit' => null,
                        'debit' => [
                            'balance' => '20000.00',
                        ],
                    ],
                    [
                        'balance' => '7000.00',
                        'credit' => [
                            'balance' => '1187.50',
                        ],
                        'debit' => null,
                    ],
                    [
                        'balance' => '3000.00',
                        'credit' => [
                            'balance' => '14000.00',
                        ],
                        'debit' => null,
                    ],
                ],
            ],
        ],
    ],
];
