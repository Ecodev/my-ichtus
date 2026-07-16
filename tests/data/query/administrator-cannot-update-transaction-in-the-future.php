<?php

declare(strict_types=1);

use Cake\Chronos\Chronos;

$tomorrow = Chronos::now()->addDays(1)->format('Y-m-d');

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!) {
            updateTransaction(id: 8000, input: $inputTransaction) {
                name
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'transactionDate' => $tomorrow,
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
                    'updateTransaction',
                ],
            ],
        ],
    ],
];
