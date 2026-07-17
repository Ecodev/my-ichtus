<?php

declare(strict_types=1);

use Cake\Chronos\Chronos;

$today = Chronos::now()->format('Y-m-d');
$todayIso = Chronos::now()->startOfDay()->format(DateTime::ATOM);
$tomorrow = Chronos::now()->addDays(1)->format('Y-m-d');

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionInput!, $lines: [TransactionLineInput!]!) {
            createTransaction(input: $inputTransaction, lines: $lines) {
                name
                transactionLines {
                    transactionDate
                }
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Transaction with a future line',
                'transactionDate' => $today,
            ],
            'lines' => [
                [
                    'name' => 'Cash payment',
                    'balance' => '100.00',
                    'transactionDate' => $tomorrow,
                    'credit' => 10026,
                ],
                [
                    'name' => 'Cash payment',
                    'balance' => '100.00',
                    'transactionDate' => $tomorrow,
                    'debit' => 10034,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'createTransaction' => [
                'name' => 'Transaction with a future line',
                'transactionLines' => [
                    [
                        'transactionDate' => $todayIso,
                    ],
                    [
                        'transactionDate' => $todayIso,
                    ],
                ],
            ],
        ],
    ],
];
