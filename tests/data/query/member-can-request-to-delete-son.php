<?php

declare(strict_types=1);

use Application\DBAL\Types\MessageTypeType;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation {
            requestUserDeletion(id: 1008)
        }',
    ],
    [
        'data' => [
            'requestUserDeletion' => true,
        ],
    ],
    null,
    function (Connection $connection): void {
        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM message WHERE type = :type AND email = :email',
            ['type' => MessageTypeType::REQUEST_USER_DELETION, 'email' => 'caissier@ichtus.ch'],
        )->fetchOne();

        Assert::assertSame(1, $count, 'should have sent 1 email to notify of new registration');
    },
];
