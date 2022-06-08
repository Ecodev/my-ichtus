<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [TransactionLineInput!]) {
            updateTransaction(id: 8000, input: $inputTransaction, lines: $lines) {
                name
                balance
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
                'name' => 'Active Member: inscription cours nautique (corrigé)',
            ],
            'lines' => [
                [
                    'name' => 'Paiement depuis crédit MyIchtus ',
                    'balance' => '150.00',
                    'transactionDate' => '2019-03-01',
                    'credit' => 10037,
                    'debit' => 10096,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'updateTransaction' => [
                'name' => 'Active Member: inscription cours nautique (corrigé)',
                'balance' => '150.00',
                'transactionLines' => [
                    [
                        'balance' => '150.00',
                        'credit' => [
                            'balance' => '150.00',
                        ],
                        'debit' => [
                            'balance' => '0.00',
                        ],
                    ],
                ],
            ],
        ],
    ],
];
