<?php

declare(strict_types=1);

use Cake\Chronos\Chronos;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\Assert;

return [
    [
        'query' => 'mutation  ($input: ConfirmRegistrationInput!) {
             confirmRegistration(token: "09876543210987654321098765432109", input: $input)
        }',
        'variables' => [
            'input' => [
                'login' => 'john.doe',
                'password' => 'douzecaracteres',
                'firstName' => 'John',
                'lastName' => 'Doe',
                'street' => 'Wallstreet',
                'locality' => 'New York',
                'postcode' => '2000',
                'birthday' => '2000-01-01',
                'mobilePhone' => '+41791234567',
            ],
        ],
    ],
    [
        'data' => [
            'confirmRegistration' => true,
        ],
    ],
    function (Connection $connection): void {
        // create a valid token for right now
        $connection->update(
            'user',
            [
                'token' => '09876543210987654321098765432109',
                'token_creation_date' => Chronos::now()->subMinutes(1)->toIso8601String(),
            ],
            [
                'id' => 1000,
            ]
        );
    },
    function (Connection $connection): void {
        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM booking WHERE owner_id = 1000 AND creation_date > DATE_SUB(NOW(), INTERVAL 1 MINUTE)',
        )->fetchOne();

        Assert::assertSame(3, $count, 'should have 3 automatic bookings freshly created');

        $count = $connection->executeQuery(
            'SELECT COUNT(*) FROM transaction WHERE owner_id = 1000 AND creation_date > DATE_SUB(NOW(), INTERVAL 1 MINUTE)',
        )->fetchOne();

        Assert::assertSame(3, $count, 'should have 3 automatic transactions freshly created');
    },
];
