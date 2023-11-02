<?php

declare(strict_types=1);

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
        'errors' => [
            [
                'message' => 'La session a expiré ou le lien n\'est pas valable. Effectue une nouvelle demande.',
                'extensions' => [
                    'showSnack' => true,
                ],
                'locations' => [
                    [
                        'line' => 2,
                        'column' => 14,
                    ],
                ],
                'path' => [
                    'confirmRegistration',
                ],
            ],
        ],
    ],
];
