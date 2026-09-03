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
                    id
                    name
                    importedId
                }
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Achat d\'un nouveau voilier (une ligne en moins)',
            ],
            // Line 14007 is not sent back, so it must be deleted, and the first line is lowered to
            // keep the transaction balanced
            'lines' => [
                [
                    'id' => 14005,
                    'name' => 'Acquisition voilier NE123456 (corrigé)',
                    'balance' => '7000.00',
                    'transactionDate' => '2019-02-04',
                    'debit' => 10034,
                ],
                [
                    'id' => 14006,
                    'name' => 'Paiement voilier par PostFinance',
                    'balance' => '7000.00',
                    'transactionDate' => '2019-02-04',
                    'credit' => 10025,
                ],
            ],
        ],
    ],
    [
        'data' => [
            'updateTransaction' => [
                'balance' => '7000.00',
                'transactionLines' => [
                    [
                        'id' => '14005',
                        'name' => 'Acquisition voilier NE123456 (corrigé)',
                        'importedId' => null,
                    ],
                    [
                        'id' => '14006',
                        'name' => 'Paiement voilier par PostFinance',
                        'importedId' => 'imported-voilier-postfinance',
                    ],
                ],
            ],
        ],
    ],
    null,
    function (Connection $connection): void {
        Assert::assertSame(
            [14005, 14006],
            array_map(intval(...), $connection->fetchFirstColumn('SELECT id FROM transaction_line WHERE transaction_id = 8005 ORDER BY id')),
        );
    },
];
