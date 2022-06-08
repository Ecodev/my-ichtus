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
            'lines' => null,
        ],
    ],
    [
        'data' => [
            'updateTransaction' => [
                'name' => 'Active Member: inscription cours nautique (corrigé)',
                'balance' => '100.00',
                'transactionLines' => [
                    [
                        'balance' => '100.00',
                        'credit' => [
                            'balance' => '100.00',
                        ],
                        'debit' => [
                            'balance' => '50.00',
                        ],
                    ],
                ],
            ],
        ],
    ],
];
