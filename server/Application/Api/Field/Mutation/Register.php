<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Field\FieldInterface;
use Application\Model\User;
use Application\Repository\UserRepository;
use Application\Service\Mailer;
use Application\Service\MessageQueuer;
use GraphQL\Type\Definition\Type;
use Zend\Expressive\Session\SessionInterface;

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
                /** @var Mailer $mailer */
                $mailer = $container->get(Mailer::class);

                /** @var MessageQueuer $messageQueuer */
                $messageQueuer = $container->get(MessageQueuer::class);

                /** @var UserRepository $repository */
                $repository = _em()->getRepository(User::class);

                /** @var User $user */
                $user = $repository->getAclFilter()->runWithoutAcl(function () use ($repository, $args) {
                    return $repository->findOneByEmail($args['email']);
                });

                $existingUser = (bool) $user;
                if (!$existingUser) {
                    $user = new User();
                    _em()->persist($user);
                }

                $user->setEmail($args['email']);
                $user->setHasInsurance($args['hasInsurance']);
                $user->setTermsAgreement($args['termsAgreement']);

                if ($existingUser && $user->getLogin()) {
                    $message = $messageQueuer->queueResetPassword($user, $user->getEmail());
                } else {
                    $message = $messageQueuer->queueRegister($user);
                }

                $mailer->sendMessageAsync($message);

                return true;
            },
        ];
    }
}
