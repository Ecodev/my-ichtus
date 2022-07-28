<?php

declare(strict_types=1);

use Laminas\Diactoros\Stream;
use Laminas\Diactoros\UploadedFile;

return [
    [
        'query' => 'mutation ($inputImage: ImageInput!) {
            createImage(input: $inputImage) {
                width
                height
            }
        }',
        'variables' => [
            'inputImage' => [
                // Fake a file uploaded with incorrect data, to check if we trust them (we should not)
                'file' => new UploadedFile(new Stream('data/images/chat1.jpg'), 999, UPLOAD_ERR_OK, 'image.jpg', 'text/plain'),
            ],
        ],
    ],
    [
        'data' => [
            'createImage' => [
                'width' => 1000,
                'height' => 482,
            ],
        ],
    ],
];
