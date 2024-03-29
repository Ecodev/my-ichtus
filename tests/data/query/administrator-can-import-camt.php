<?php

declare(strict_types=1);

use Laminas\Diactoros\Stream;
use Laminas\Diactoros\UploadedFile;

return [
    [
        'query' => 'mutation ($file: Upload!) {
            importCamt(file: $file) {
                name
            }
        }',
        'variables' => [
            // Fake a file uploaded with incorrect data, to check if we trust them (we should not)
            'file' => new UploadedFile(new Stream('tests/data/importer/minimal.xml'), 999, UPLOAD_ERR_OK, 'image.jpg', 'text/plain'),
        ],
    ],
    [
        'data' => [
            'importCamt' => [
                [
                    'name' => 'Versement BVR',
                ],
            ],
        ],
    ],
];
