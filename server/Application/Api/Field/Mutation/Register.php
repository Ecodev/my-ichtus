<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Model\Log;
use Application\Model\User;
use Application\Repository\LogRepository;
use Application\Repository\UserRepository;
use Application\Service\MessageQueuer;
use Ecodev\Felix\Api\ExceptionWithoutMailLogging;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Service\Mailer;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class Register implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'register',
            'type' => Type::nonNull(Type::boolean()),
            'description' => 'First step to register as a new user.',
            'args' => [
                'email' => Type::nonNull(_types()->get('Email')),
                'hasInsurance' => Type::nonNull(Type::boolean()),
                'termsAgreement' => Type::nonNull(Type::boolean()),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): bool {
                global $container;

                /** @var LogRepository $logRepository */
                $logRepository = _em()->getRepository(Log::class);

                // We don't want to disclose whether an user already exists, so we show
                // the same error for both too many register and password reset attempts
                if ($logRepository->updatePasswordFailedOften() || $logRepository->registerOften()) {
                    throw new ExceptionWithoutMailLogging('Trop de tentatives. Veuillez réessayer plus tard.');
                }

                /** @var Mailer $mailer */
                $mailer = $container->get(Mailer::class);

                /** @var MessageQueuer $messageQueuer */
                $messageQueuer = $container->get(MessageQueuer::class);

                /** @var UserRepository $repository */
                $repository = _em()->getRepository(User::class);

                /** @var null|User $user */
                $user = $repository->getAclFilter()->runWithoutAcl(fn () => $repository->findOneByEmail($args['email']));

                $existingUser = (bool) $user;
                if (!$existingUser) {
                    $user = new User();
                    _em()->persist($user);
                }

                $user->setEmail($args['email']);
                $user->setHasInsurance($args['hasInsurance']);
                $user->setTermsAgreement($args['termsAgreement']);

                if ($existingUser && $user->getLogin()) {
                    _log()->info(LogRepository::REQUEST_PASSWORD_RESET);
                    $message = $messageQueuer->queueResetPassword($user);
                } else {
                    _log()->info(LogRepository::REGISTER);
                    $message = $messageQueuer->queueRegister($user);
                }

                if ($message) {
                    $mailer->sendMessageAsync($message);
                }

                return true;
            },
        ];
    }
}
