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
            'id' => 3032,
        ],
    ],
    [
        'data' => [
            'updateBookable' => [
                'remarks' => 'test remarks',
                'name' => 'Cours nautique (3032, admin approved, dispo)',
            ],
        ],
    ],
];
