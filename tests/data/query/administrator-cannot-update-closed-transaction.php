<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!) {
            updateTransaction(id: 8007, input: $inputTransaction) {
                name
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Solde à nouveau (corrigé)',
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'User "administrator" with role administrator is not allowed on resource "Transaction#8007" with privilege "update" because the transaction belongs to a closed accounting period',
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
