<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Model\User;
use Application\Repository\UserRepository;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;

abstract class UserByToken implements FieldInterface
{
    public static function build(): array
    {
        return
            [
                'name' => 'userByToken',
                'type' => Type::nonNull(_types()->getOutput(User::class)),
                'description' => 'Get a user by its temporary token',
                'args' => [
                    'token' => Type::nonNull(_types()->get('Token')),
                ],
                'resolve' => function ($root, array $args): User {
                    /** @var UserRepository $repository */
                    $repository = _em()->getRepository(User::class);

                    /** @var null|User $user */
                    $user = $repository->getAclFilter()->runWithoutAcl(function () use ($repository, $args) {
                        return $repository->findOneByToken($args['token']);
                    });

                    if (!$user) {
                        throw new Exception('User not found for token `' . $args['token'] . '`.');
                    }

                    if (!$user->isTokenValid()) {
                        throw new Exception('Le lien que vous avez suivi est périmé. Veuillez effectuer une nouvelle demande.');
                    }

                    // Set current user for his ACL, but not in persisted session, only for the remaining execution time.
                    // He will have to go through a proper login to persist the session.
                    User::setCurrent($user);

                    return $user;
                },
            ];
    }
}
