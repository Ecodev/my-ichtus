<?php

declare(strict_types=1);

use Application\DBAL\Types\MessageTypeType;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation {
            requestPasswordReset(login: "newmember@example.com")
        }',
    ],
    [
        'data' => [
            'requestPasswordReset' => false,
        ],
    ],
    function (Connection $connection): void {
        $connection->executeStatement(
            'UPDATE user SET login = "" WHERE email = :email',
            ['email' => 'newmember@example.com']
        );
    },
    function (Connection $connection): void {
        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM message WHERE type = :type AND email = :email',
            ['type' => MessageTypeType::REGISTER, 'email' => 'newmember@example.com']
        )->fetchOne();

        Assert::assertSame(1, $count, 'should have sent 1 email to confirm user');
    },
];
