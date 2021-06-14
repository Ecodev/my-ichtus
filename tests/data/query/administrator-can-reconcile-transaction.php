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
            'id' => 14007,
            'isReconciled' => true,
        ],
    ],
    [
        'data' => [
            'reconcileTransactionLine' => [
                'id' => 14007,
                'isReconciled' => true,
            ],
        ],
    ],
];
