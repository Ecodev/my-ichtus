<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;

abstract class ExcelExport implements FieldInterface
{
    public static function build(): array
    {
        return
            [
                'name' => 'excelExport',
                'type' => Type::nonNull(Type::string()),
                'description' => 'URL to download the Excel listing',
                'resolve' => function ($root, array $args): string {
                    return 'test';
                },
            ];
    }
}
