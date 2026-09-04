<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($id: TransactionLineID!, $isReconciled: Boolean!) {
            reconcileTransactionLine(id: $id, isReconciled: $isReconciled) {
                id
                isReconciled
            }
        }',
        'variables' => [
            'id' => 14009,
            'isReconciled' => false,
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
                    'reconcileTransactionLine',
                ],
            ],
        ],
    ],
];
