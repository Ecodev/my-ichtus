<?php

declare(strict_types=1);

return [
    [
        'query' => '{
            users(pagination: {pageIndex:0, pageSize: 2}) {
                length
                pageIndex
                items {
                    id
                }
            }
        }',
    ],
    [
        'data' => [
            'users' => [
                'length' => 12,
                'pageIndex' => 0,
                'items' => [
                    [
                        'id' => 1000,
                    ],
                    [
                        'id' => 1001,
                    ],
                ],
            ],
        ],
    ],
];
