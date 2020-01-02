<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Exception;
use Application\Api\Field\FieldInterface;
use Application\Api\Scalar\LoginType;
use Application\Model\Log;
use Application\Model\User;
use Application\Repository\LogRepository;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionCookiePersistenceInterface;
use Mezzio\Session\SessionInterface;

abstract class Login implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'login',
            'type' => Type::nonNull(_types()->getOutput(User::class)),
            'description' => 'Log in a user',
            'args' => [
                'login' => Type::nonNull(_types()->get(LoginType::class)),
                'password' => Type::nonNull(Type::string()),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): User {
                if (_em()->getRepository(Log::class)->loginFailedOften()) {
                    throw new Exception("Trop de tentatives d'accès ont échouées. Veuillez ressayer plus tard.");
                }

                // Logout
                $session->clear();
                User::setCurrent(null);

                $user = _em()->getRepository(User::class)->getOneByLoginPassword($args['login'], $args['password']);

                // If we successfully authenticated
                if ($user) {
                    $session->regenerate();
                    $session->set(SessionCookiePersistenceInterface::SESSION_LIFETIME_KEY, 365 * 86400);
                    $session->set('user', $user->getId());
                    User::setCurrent($user);
                    _log()->info(LogRepository::LOGIN);

                    return $user;
                }

                _log()->info(LogRepository::LOGIN_FAILED);

                throw new Exception("Le nom d'utilisateur ou mot de passe est incorrect !");
            },
        ];
    }
}
