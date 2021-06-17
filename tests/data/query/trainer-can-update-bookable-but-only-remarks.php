<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation ($id: BookableID!) {
            updateBookable(id: $id, input: {remarks: "test remarks", name: "test name"}) {
                    remarks
                    name
                }
            }',
        'variables' => [
            'id' => 3003,
        ],
    ],
    [
        'data' => [
            'updateBookable' => [
                'remarks' => 'test remarks',
                'name' => 'Casier 1012 (3003, inventaire / spécifique admin, periodic)',
            ],
        ],
    ],
];
