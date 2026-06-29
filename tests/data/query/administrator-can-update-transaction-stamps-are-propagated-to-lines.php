<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [TransactionLineInput!]) {
            updateTransaction(id: 8000, input: $inputTransaction, lines: $lines) {
                updater {
                    email
                }
                creator {
                    email
                }
                transactionLines {
                    creator {
                        email
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
                    'name' => 'Paiement depuis crédit MyIchtus',
                    'balance' => '100.00',
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
                'updater' => ['email' => 'administrator@example.com'],
                'creator' => ['email' => 'member@example.com'],
                'transactionLines' => [
                    ['creator' => ['email' => 'member@example.com']],
                ],
            ],
        ],
    ],
];
