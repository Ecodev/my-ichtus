<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            updateAccount(id: 10034, input: {budgetAllowed: 1000}) {
                id
                totalBalance
                budgetAllowed
                budgetBalance
            }
        }
        ',
    ],
    [
        'data' => [
            'updateAccount' => [
                'id' => '10034',
                'totalBalance' => '10000.00',
                'budgetAllowed' => '1000.00',
                'budgetBalance' => '-9000.00',
            ],
        ],
    ],
];
