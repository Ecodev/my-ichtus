<?php

declare(strict_types=1);

use Cake\Chronos\Chronos;

$today = Chronos::now()->format('Y-m-d');
$tomorrow = Chronos::now()->addDays(1)->format('Y-m-d');

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionInput!, $lines: [TransactionLineInput!]!) {
            createTransaction(input: $inputTransaction, lines: $lines) {
                name
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Transaction avec ligne du futur',
                'transactionDate' => $today,
            ],
            'lines' => [
                [
                    'name' => 'Paiement cash',
                    'balance' => '100.00',
                    'transactionDate' => $tomorrow,
                    'credit' => 10026,
                ],
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'La date d\'écriture ne peut pas être dans le futur',
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
