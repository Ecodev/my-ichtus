<?php

declare(strict_types=1);

return [
    [
        'query' => 'query ($dateFrom: Date!, $dateTo: Date) {
            indicatorReport(dateFrom: $dateFrom, dateTo: $dateTo) {
                indicatorDefinition {
                    id
                    name
                    addends {
                        multiplier
                        account {
                            id
                        }
                    }
                    subtrahends {
                        multiplier
                        account {
                            id
                        }
                    }
                }
                value
                budgetAllowed
                budgetBalance
            }
        }',
        'variables' => [
            'dateFrom' => '2019-01-01',
            'dateTo' => '2019-12-31',
        ],
    ],
    [
        'data' => [
            'indicatorReport' => [
                [
                    'indicatorDefinition' => [
                        'id' => '14000',
                        'name' => 'Nautique - Bateau à moteur',
                        'addends' => [
                            [
                                'multiplier' => 10,
                                'account' => [
                                    'id' => '10030',
                                ],
                            ],
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10058',
                                ],
                            ],
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10059',
                                ],
                            ],
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10060',
                                ],
                            ],
                        ],
                        'subtrahends' => [],
                    ],
                    'value' => '0.00',
                    'budgetAllowed' => '1000.00',
                    'budgetBalance' => '1000.00',
                ],
                [
                    'indicatorDefinition' => [
                        'id' => '14001',
                        'name' => 'Gestion - administration',
                        'addends' => [
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10085',
                                ],
                            ],
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10087',
                                ],
                            ],
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10088',
                                ],
                            ],
                        ],
                        'subtrahends' => [],
                    ],
                    'value' => '12.50',
                    'budgetAllowed' => '100.00',
                    'budgetBalance' => '87.50',
                ],
                [
                    'indicatorDefinition' => [
                        'id' => '14002',
                        'name' => 'Recette - Cours nautique',
                        'addends' => [
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10037',
                                ],
                            ],
                        ],
                        'subtrahends' => [
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10104',
                                ],
                            ],
                        ],
                    ],
                    'value' => '90.00',
                    'budgetAllowed' => '0.00',
                    'budgetBalance' => '-90.00',
                ],
                [
                    'indicatorDefinition' => [
                        'id' => '14003',
                        'name' => 'Recette - Cotisations',
                        'addends' => [
                            [
                                'multiplier' => 100,
                                'account' => [
                                    'id' => '10035',
                                ],
                            ],
                        ],
                        'subtrahends' => [],
                    ],
                    'value' => '90.00',
                    'budgetAllowed' => '0.00',
                    'budgetBalance' => '-90.00',
                ],
            ],
        ],
    ],
];
