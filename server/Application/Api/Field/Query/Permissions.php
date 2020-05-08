<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Api\Output\AllPermissionsType;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;

abstract class Permissions implements FieldInterface
{
    public static function build(): array
    {
        return
            [
                'name' => 'permissions',
                'type' => Type::nonNull(_types()->get(AllPermissionsType::class)),
                'description' => 'All permissions for currently logged in user',
                'args' => [
                ],
                'resolve' => function ($root, array $args, $context, ResolveInfo $info) {
                    $contexts = $args;

                    // Return keys with some dummy data to keep the resolving process going deeper in types
                    return [
                        'crud' => ['contexts' => $contexts],
                    ];
                },
            ];
    }
}
