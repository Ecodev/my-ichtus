<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Exception;
use Application\Api\Field\FieldInterface;
use Application\Api\Scalar\PasswordType;
use Application\Api\Scalar\TokenType;
use Application\Model\Log;
use Application\Model\User;
use Application\Repository\LogRepository;
use Application\Repository\UserRepository;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class UpdatePassword implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'updatePassword',
            'type' => Type::nonNull(Type::boolean()),
            'description' => 'Update the password for the user identified by the token. Return false if token is invalid',
            'args' => [
                'token' => Type::nonNull(_types()->get(TokenType::class)),
                'password' => Type::nonNull(_types()->get(PasswordType::class)),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): bool {
                /** @var LogRepository $logRepository */
                $logRepository = _em()->getRepository(Log::class);
                if ($logRepository->updatePasswordFailedOften()) {
                    throw new Exception('Trop de tentatives de changement de mot de passe ont échouées. Veuillez ressayer plus tard.');
                }

                /** @var UserRepository $repository */
                $repository = _em()->getRepository(User::class);

                /** @var User $user */
                $user = $repository->getAclFilter()->runWithoutAcl(function () use ($repository, $args) {
                    return $repository->findOneByToken($args['token']);
                });

                if (!$user || !$user->isTokenValid()) {
                    _log()->info(LogRepository::UPDATE_PASSWORD_FAILED);

                    return false;
                }

                $user->setPassword($args['password']);
                _em()->flush();
                _log()->info(LogRepository::UPDATE_PASSWORD);

                return true;
            },
        ];
    }
}
