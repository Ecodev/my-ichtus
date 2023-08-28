<?php

declare(strict_types=1);

use Application\DBAL\Types\MessageTypeType;
use Cake\Chronos\ChronosDate;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation {
            leaveFamily(id: 1007) {
                id
                internalRemarks
            }
        }',
    ],
    [
        'data' => [
            'leaveFamily' => [
                'id' => 1007,
                'internalRemarks' => ChronosDate::now()->toDateString() . ': détaché du ménage par Conj Oint',
            ],
        ],
    ],
    null,
    function (Connection $connection): void {
        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM message WHERE type = :type AND email = :email',
            [
                'type' => MessageTypeType::LEAVE_FAMILY,
                'email' => 'conjoint@example.com',
            ]
        )->fetchOne();

        Assert::assertSame(1, $count, 'should have sent 1 email to notify user');

        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM message WHERE type = :type AND email = :email',
            [
                'type' => MessageTypeType::ADMIN_LEAVE_FAMILY,
                'email' => 'caissier@ichtus.ch',
            ]
        )->fetchOne();

        Assert::assertSame(1, $count, 'should have sent 1 email to notify admin');
    },
];
