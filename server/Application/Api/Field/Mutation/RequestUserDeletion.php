<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Model\User;
use Application\Service\MessageQueuer;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Service\Mailer;
use GraphQL\Type\Definition\Type;

abstract class RequestUserDeletion implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'requestUserDeletion' => fn () => [
            'type' => Type::nonNull(Type::boolean()),
            'description' => 'Send an email to admins to delete the given user',
            'args' => [
                'id' => Type::nonNull(_types()->getId(User::class)),
            ],
            'resolve' => function ($root, array $args): bool {
                /** @var User $user */
                $user = $args['id']->getEntity();

                // Check ACL
                // Assume that if we can update, then we can request to delete
                Helper::throwIfDenied($user, 'update');

                global $container;
                /** @var Mailer $mailer */
                $mailer = $container->get(Mailer::class);

                /** @var MessageQueuer $messageQueuer */
                $messageQueuer = $container->get(MessageQueuer::class);

                $message = $messageQueuer->queueRequestUserDeletion(User::getCurrent(), $user);
                if ($message) {
                    $mailer->sendMessageAsync($message);
                }

                return true;
            },
        ];
    }
}
