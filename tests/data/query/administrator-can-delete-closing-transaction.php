<?php

declare(strict_types=1);

use Application\Model\Transaction;
use Application\Repository\TransactionRepository;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        // Transaction 8005 is the closing itself, and a closing must stay deletable to undo a
        // bouclement made by mistake
        'query' => 'mutation {
            deleteTransactions(ids: [8005])
        }',
    ],
    [
        'data' => [
            'deleteTransactions' => true,
        ],
    ],
    null,
    function (Connection $connection): void {
        /** @var TransactionRepository $transactionRepository */
        $transactionRepository = _em()->getRepository(Transaction::class);

        Assert::assertNull($transactionRepository->getLastClosingDate(), 'deleting the closing must forget the closing date that was read before the deletion');
    },
];
