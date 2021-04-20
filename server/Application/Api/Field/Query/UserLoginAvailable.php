<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Model\User;
use Application\Repository\UserRepository;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;

abstract class UserLoginAvailable implements FieldInterface
{
    public static function build(): array
    {
        return
            [
                'name' => 'userLoginAvailable',
                'type' => Type::nonNull(Type::boolean()),
                'description' => 'Whether the given user login is available',
                'args' => [
                    [
                        'name' => 'login',
                        'type' => Type::nonNull(Type::string()),
                    ],
                    [
                        'name' => 'excluded',
                        'type' => _types()->getId(User::class),
                    ],
                ],
                'resolve' => function ($root, array $args): bool {
                    $id = @$args['excluded'] ? (int) $args['excluded']->getId() : null;

                    /** @var UserRepository $repository */
                    $repository = _em()->getRepository(User::class);

                    return !$repository->exists($args['login'], $id);
                },
            ];
    }
}
