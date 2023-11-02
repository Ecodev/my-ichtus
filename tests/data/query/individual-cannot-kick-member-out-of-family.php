<?php

declare(strict_types=1);

return [
    [
        'query' => 'mutation {
            leaveFamily(id: 1002) {
                id
                internalRemarks
            }
        }',
    ],
    [
        'errors' => [
            [
                'message' => 'User "individual" with role individual is not allowed on resource "User#1002" with privilege "update" because it is not himself',
                'extensions' => [
                    'showSnack' => true,
                ],
                'locations' => [
                    [
                        'line' => 2,
                        'column' => 13,
                    ],
                ],
                'path' => [
                    'leaveFamily',
                ],
            ],
        ],
    ],
];
