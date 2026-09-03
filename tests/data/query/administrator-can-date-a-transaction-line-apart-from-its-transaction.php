<?php

declare(strict_types=1);

use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [UpdatableTransactionLineInput!]) {
            updateTransaction(id: 8000, input: $inputTransaction, lines: $lines) {
                id
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'transactionDate' => '2019-04-01',
            ],
            // The line is dated before the transaction it belongs to, and must keep that date
            'lines' => [
                [
                    'id' => 14000,
                    'name' => 'Inscription cours nautique Active Member',
                    'balance' => '100.00',
                    'transactionDate' => '2019-03-15',
                    'debit' => 10096,
                    'credit' => 10037,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'updateTransaction' => [
                'id' => '8000',
            ],
        ],
    ],
    null,
    function (Connection $connection): void {
        Assert::assertSame('2019-04-01 00:00:00', $connection->fetchOne('SELECT transaction_date FROM `transaction` WHERE id = 8000'));
        Assert::assertSame('2019-03-15 00:00:00', $connection->fetchOne('SELECT transaction_date FROM transaction_line WHERE id = 14000'));
    },
];
