<?php

declare(strict_types=1);

use Application\DBAL\Types\MessageTypeType;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation {
            requestPasswordReset(login: "newmember")
        }',
    ],
    [
        'data' => [
            'requestPasswordReset' => false,
        ],
    ],
    function (Connection $connection): void {
        $connection->executeStatement(
            'UPDATE user SET password = "" WHERE email = :email',
            ['email' => 'newmember@example.com']
        );
    },
    function (Connection $connection): void {
        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM message WHERE type = :type AND email = :email',
            ['type' => MessageTypeType::RESET_PASSWORD, 'email' => 'newmember@example.com']
        )->fetchOne();

        Assert::assertSame(1, $count, 'should have sent 1 email to reset password');
    },
];
