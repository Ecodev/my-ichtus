<?php

declare(strict_types=1);

use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [UpdatableTransactionLineInput!]) {
            updateTransaction(id: 8005, input: $inputTransaction, lines: $lines) {
                balance
                transactionLines {
                    name
                    debit {
                        code
                        balance
                    }
                }
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Achat d\'un nouveau voilier (compte corrigé)',
            ],
            'lines' => [
                [
                    'id' => 14005,
                    'name' => 'Acquisition voilier NE123456',
                    'balance' => '10000.00',
                    'transactionDate' => '2019-02-04',
                    'debit' => 10027,
                ],
                [
                    'id' => 14006,
                    'name' => 'Paiement voilier par PostFinance',
                    'balance' => '7000.00',
                    'transactionDate' => '2019-02-04',
                    'credit' => 10025,
                ],
                [
                    'id' => 14007,
                    'name' => 'Paiement voilier par Raiffeisen',
                    'balance' => '3000.00',
                    'transactionDate' => '2019-02-04',
                    'credit' => 10026,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'updateTransaction' => [
                'balance' => '10000.00',
                'transactionLines' => [
                    [
                        'name' => 'Acquisition voilier NE123456',
                        'debit' => [
                            'code' => 1500,
                            'balance' => '10000.00',
                        ],
                    ],
                    [
                        'name' => 'Paiement voilier par PostFinance',
                        'debit' => null,
                    ],
                    [
                        'name' => 'Paiement voilier par Raiffeisen',
                        'debit' => null,
                    ],
                ],
            ],
        ],
    ],
    null,
    function (Connection $connection): void {
        Assert::assertSame([
            // 150 Immobilisation corporelles meubles, the common parent of both accounts
            ['id' => 10010, 'balance' => 1000000],
            // 1500 Machines et appareils, the account that was joined
            ['id' => 10027, 'balance' => 1000000],
            // 1510 Mobilier et installations, the parent of the account that was left
            ['id' => 10028, 'balance' => 0],
            // 15106 Voilier, the account that was left
            ['id' => 10034, 'balance' => 0],
        ], $connection->fetchAllAssociative('SELECT id, balance FROM account WHERE id IN (10010, 10027, 10028, 10034) ORDER BY id'));
    },
];
