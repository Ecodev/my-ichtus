<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Model\User;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;

abstract class DeleteUsers implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'deleteUsers' => fn () => [
            'type' => Type::nonNull(Type::boolean()),
            'description' => 'Delete one or several existing user with all its logs, messages and tags',
            'args' => [
                'ids' => Type::nonNull(Type::listOf(Type::nonNull(_types()->getId(User::class)))),
            ],
            'resolve' => function ($root, array $args): bool {
                foreach ($args['ids'] as $id) {
                    /** @var User $user */
                    $user = $id->getEntity();

                    // Check ACL
                    Helper::throwIfDenied($user, 'delete');

                    $account = $user->getAccount();
                    if ($account?->getOwner() === $user) {
                        $account->setName(_tr('Anonyme %id%', ['id' => '#' . $user->getId()]));
                        $account->setIban('');
                    }

                    // Do it
                    _em()->remove($user);
                }

                _em()->flush();

                return true;
            },
        ];
    }
}
