<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\DBAL\Types\RelationshipType;
use Application\Model\Log;
use Application\Model\User;
use Application\Repository\LogRepository;
use Application\Repository\UserRepository;
use Application\Service\MessageQueuer;
use Ecodev\Felix\Api\ExceptionWithoutMailLogging;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Api\Scalar\LoginType;
use Ecodev\Felix\Service\Mailer;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class RequestPasswordReset implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'requestPasswordReset',
            'type' => Type::nonNull(_types()->get('Relationship')),
            'description' => 'Request to send an email to reset the password for the given user. It will **always** return a successful response, even if the user is not found.',
            'args' => [
                'login' => Type::nonNull(_types()->get(LoginType::class)),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): string {
                global $container;

                _log()->info(LogRepository::REQUEST_PASSWORD_RESET);

                /** @var LogRepository $logRepository */
                $logRepository = _em()->getRepository(Log::class);
                if ($logRepository->requestPasswordResetOften()) {
                    throw new ExceptionWithoutMailLogging('Trop de tentatives de changement de mot de passe. Veuillez réessayer plus tard.');
                }

                /** @var Mailer $mailer */
                $mailer = $container->get(Mailer::class);

                /** @var MessageQueuer $messageQueuer */
                $messageQueuer = $container->get(MessageQueuer::class);

                /** @var UserRepository $repository */
                $repository = _em()->getRepository(User::class);

                /** @var null|User $user */
                $user = $repository->getOneByLogin($args['login']);
                $relationship = RelationshipType::HOUSEHOLDER;

                if ($user) {
                    $email = $user->getEmail();

                    // Fallback to householder if any
                    if (!$email && $user->getOwner()) {
                        $email = $repository->getAclFilter()->runWithoutAcl(function () use ($user) {
                            return $user->getOwner()->getEmail();
                        });

                        $relationship = $user->getFamilyRelationship();
                    }

                    if ($email) {
                        $message = $messageQueuer->queueResetPassword($user, $email);
                        $mailer->sendMessageAsync($message);
                    }
                }

                // Here we lie to client, and always say we are successful, to avoid data leak
                return $relationship;
            },
        ];
    }
}
