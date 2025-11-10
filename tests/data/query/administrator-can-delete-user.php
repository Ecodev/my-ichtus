<?php

declare(strict_types=1);

use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation {
            deleteUsers(ids: [1002])
        }',
    ],
    [
        'data' => [
            'deleteUsers' => true,
        ],
    ],
    null,
    function (Connection $connection): void {
        $count = $connection->executeQuery(
            "SELECT COUNT(*) FROM account WHERE id = 10096 AND name = 'Anonyme #1002'",
        )->fetchOne();

        Assert::assertSame(1, $count, 'should have anonymized account');
    },
];
