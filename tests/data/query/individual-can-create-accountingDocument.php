<?php

declare(strict_types=1);

use Laminas\Diactoros\UploadedFile;

return [
    [
        'query' => 'mutation ($inputDocument: AccountingDocumentInput!) {
            createAccountingDocument(input: $inputDocument) {
                expenseClaim {
                    id
                }
            }
        }',
        'variables' => [
            'inputDocument' => [
                // Fake a file uploaded with incorrect data, to check if we trust them (we should not)
                'file' => new UploadedFile('data/accounting/dw4jV3zYSPsqE2CB8BcP8ABD0.pdf', 999, UPLOAD_ERR_OK, 'invoice.pdf', 'text/plain'),
                'expenseClaim' => 7003,
            ],
        ],
    ],
    [
        'data' => [
            'createAccountingDocument' => [
                'expenseClaim' => [
                    'id' => 7003,
                ],
            ],
        ],
    ],
];
