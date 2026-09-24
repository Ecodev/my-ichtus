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
                    name
                    credit {
                        code
                        balance
                    }
                }
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Cotisation 2019 (compte corrigé)',
            ],
            'lines' => [
                [
                    'id' => 14002,
                    'name' => 'Cotisation 2019',
                    'balance' => '90.00',
                    'transactionDate' => '2019-03-12',
                    'debit' => 10096,
                    'credit' => 10013,
                ],
                [
                    'id' => 14011,
                    'name' => 'Contribution au fond de réparation interne',
                    'balance' => '10.00',
                    'transactionDate' => '2019-03-12',
                    'debit' => 10096,
                    'credit' => 10104,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'updateTransaction' => [
                'balance' => '100.00',
                'transactionLines' => [
                    [
                        'name' => 'Cotisation 2019',
                        'credit' => [
                            'code' => 3200,
                            'balance' => '90.00',
                        ],
                    ],
                    [
                        'name' => 'Contribution au fond de réparation interne',
                        'credit' => [
                            'code' => 2600,
                            'balance' => '10.00',
                        ],
                    ],
                ],
            ],
        ],
    ],
    null,
    function (Connection $connection): void {
        Assert::assertSame([
            // 3 Produits, the common parent of both accounts
            ['id' => 10002, 'balance' => 24000],
            // 3200 Vente de matériel, the account that was joined
            ['id' => 10013, 'balance' => 9000],
            // 3400 Vente de prestation, the parent of the account that was left
            ['id' => 10014, 'balance' => 15000],
            // 34000 Cotisations, the account that was left
            ['id' => 10035, 'balance' => 0],
        ], $connection->fetchAllAssociative('SELECT id, balance FROM account WHERE id IN (10002, 10013, 10014, 10035) ORDER BY id'));
    },
];
