<?php

declare(strict_types=1);

use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        // Transaction 8005 is the accounting closing, whose lines are locked but still sent back
        // unchanged by the form, while its label and the remarks stay free
        'query' => 'mutation ($inputTransaction: TransactionPartialInput!, $lines: [UpdatableTransactionLineInput!]) {
            updateTransaction(id: 8005, input: $inputTransaction, lines: $lines) {
                remarks
            }
        }',
        'variables' => [
            'inputTransaction' => [
                'name' => 'Bouclement vérifié',
                'transactionDate' => '2019-02-04',
                'remarks' => 'Validé par la fiduciaire',
                'internalRemarks' => 'Pièce signée en annexe',
            ],
            'lines' => [
                [
                    'id' => 14005,
                    'name' => 'Acquisition voilier NE123456',
                    'balance' => '10000.00',
                    'transactionDate' => '2019-02-04',
                    'debit' => 10034,
                    'remarks' => 'Contrôlé',
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
                'remarks' => 'Validé par la fiduciaire',
            ],
        ],
    ],
    null,
    function (Connection $connection): void {
        $line = $connection->fetchAssociative('SELECT name, remarks, balance FROM transaction_line WHERE id = 14005');

        Assert::assertSame(['name' => 'Acquisition voilier NE123456', 'remarks' => 'Contrôlé', 'balance' => 1000000], $line);
    },
];
