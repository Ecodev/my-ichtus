<?php

declare(strict_types=1);

return [
    [
        // Transaction 8009 is dated ten years in the future, so it is freely editable, but pulling
        // it back before the closing of 2019-02-04 would change an already closed period
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!) {
            updateTransaction(id: 8009, input: $inputTransaction) {
                name
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'transactionDate' => '2019-01-15',
            ],
        ],
    ],
    [
        'errors' => [
            [
                'message' => 'User "administrator" with role administrator is not allowed on resource "Transaction#8009" with privilege "update" because the transaction belongs to a closed accounting period',
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
