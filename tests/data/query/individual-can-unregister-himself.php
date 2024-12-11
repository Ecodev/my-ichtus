<?php

declare(strict_types=1);

use Application\DBAL\Types\MessageTypeType;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation {
            unregister(id: 1007)
        }',
    ],
    [
        'data' => [
            'unregister' => true,
        ],
    ],
    null,
    function (Connection $connection): void {
        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM message WHERE type = :type AND email = :email',
            [
                'type' => MessageTypeType::UNREGISTER,
                'email' => 'administrator@example.com',
            ]
        )->fetchOne();

        Assert::assertSame(1, $count, 'should have sent 1 email to notify admin');
    },
];
