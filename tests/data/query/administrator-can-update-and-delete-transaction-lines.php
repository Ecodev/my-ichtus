<?php

declare(strict_types=1);

use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [UpdatableTransactionLineInput!]) {
            updateTransaction(id: 8002, input: $inputTransaction, lines: $lines) {
                balance
                transactionLines {
                    id
                    name
                }
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Cotisation 2019 (une ligne en moins)',
            ],
            // Line 14011 is not sent back, so it must be deleted
            'lines' => [
                [
                    'id' => 14002,
                    'name' => 'Cotisation 2019 (corrigée)',
                    'balance' => '90.00',
                    'transactionDate' => '2019-03-12',
                    'debit' => 10096,
                    'credit' => 10035,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'updateTransaction' => [
                'balance' => '90.00',
                'transactionLines' => [
                    [
                        'id' => '14002',
                        'name' => 'Cotisation 2019 (corrigée)',
                    ],
                ],
            ],
        ],
    ],
    null,
    function (Connection $connection): void {
        Assert::assertSame(
            [14002],
            array_map(intval(...), $connection->fetchFirstColumn('SELECT id FROM transaction_line WHERE transaction_id = 8002 ORDER BY id')),
        );
    },
];
