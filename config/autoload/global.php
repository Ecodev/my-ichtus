<?php

declare(strict_types=1);

/**
 * Default configuration that can be overridden by a local.php, but it at least ensure
 * that required keys exist with "safe" values.
 */
return [
    'hostname' => 'my-ichtus.lan',
    'email' => [
        'from' => 'noreply@my-ichtus.lan',
        'toOverride' => null,
    ],
    'smtp' => null,
    'phpPath' => '/usr/bin/php7.4',
    'doorsApi' => [
        'endpoint' => 'http://localhost:8888',
        'token' => 'my-token-value',
    ],
    'templates' => [
        'paths' => [
            'app' => ['server/templates/app'],
            'error' => ['server/templates/error'],
            'layout' => ['server/templates/layout'],
        ],
    ],
    'banking' => [
        'iban' => 'CH2730000001200061375', // QR-IBAN without spaces (eg: CH7030123036078110002)
        'paymentTo' => 'PostFinance AG, 3030 Bern',  // Bank coordinate the payment will be made to, eg: 'Banque Alternative Suisse SA'
        'paymentFor' => 'Club nautique Ichtus' . PHP_EOL . '2072 St-Blaise', // Name and address of account holder, 2-3 lines separated by \n
    ],
    'accounting' => [
        // Codes of special accounts used for automatic transactions
        'salesAccountCode' => 3200, // Ventes de marchandises
        'bankAccountCode' => 1020, // Banque
        'customerDepositsAccountCode' => 2030, // Acomptes de clients
        'closingAccountCode' => 9200, // Bénéfice/perte de l'exercice
        'carryForwardAccountCode' => 2970, // Bénéfice/perte reporté
        'report' => [
            'showAccountsWithZeroBalance' => false,
            'maxAccountDepth' => 3,
        ],
    ],
    'datatrans' => [
        'merchantId' => '',
        'key' => 'secret-HMAC-key',
        'production' => false,
        'endpoint' => 'https://pay.sandbox.datatrans.com',
    ],
];
