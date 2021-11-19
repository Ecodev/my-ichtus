<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Model\User;
use Application\Repository\UserRepository;
use Ecodev\Felix\Api\ExceptionWithoutMailLogging;
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
                    $user = $repository->getAclFilter()->runWithoutAcl(fn () => $repository->findOneByToken($args['token']));

                    if (!$user) {
                        throw new ExceptionWithoutMailLogging("Le lien que tu as suivi n'est pas valable ou a déjà été utilisé. Effectue une nouvelle demande de changement de mot de passe ou création de compte. Chaque nouvelle demande invalide les précédentes.");
                    }

                    if (!$user->isTokenValid()) {
                        throw new ExceptionWithoutMailLogging('Le lien que tu as suivi est périmé. Effectue une nouvelle demande.');
                    }

                    return $user;
                },
            ];
    }
}
