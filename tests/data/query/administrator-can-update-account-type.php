<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($inputAccount: AccountPartialInput!) {
            updateAccount(id: 10026 input: $inputAccount) {
                id
                type
                balance
            }
        }',
        'variables' => [
            'inputAccount' => [
                'type' => 'Liability',
            ],
        ],
    ],
    [
        'data' => [
            'updateAccount' => [
                'id' => 10026,
                'type' => 'Liability',
                'balance' => '-17000.00',
            ],
        ],
    ],
];
