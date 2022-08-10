<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\DBAL\Types\RelationshipType;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Service\MessageQueuer;
use Cake\Chronos\Date;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Service\Mailer;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class LeaveFamily implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'leaveFamily',
            'type' => Type::nonNull(_types()->getOutput(User::class)),
            'description' => 'Make the given user independent from his family and inactive.',
            'args' => [
                'id' => Type::nonNull(_types()->getId(User::class)),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): User {
                global $container;
                /** @var Mailer $mailer */
                $mailer = $container->get(Mailer::class);

                /** @var MessageQueuer $messageQueuer */
                $messageQueuer = $container->get(MessageQueuer::class);

                /** @var User $user */
                $user = $args['id']->getEntity();

                // Check ACL
                Helper::throwIfDenied($user, 'update');

                // Set owner while pretending we are an admin to workaround normal security things
                $previousCurrentUser = User::getCurrent();
                User::setCurrent(new User(User::ROLE_ADMINISTRATOR));
                $user->setOwner(null);
                User::setCurrent($previousCurrentUser);

                $user->setFamilyRelationship(RelationshipType::HOUSEHOLDER);
                $user->setStatus(User::STATUS_INACTIVE);

                // Append a line to internal remarks
                $internalRemarks = implode(PHP_EOL . PHP_EOL, array_filter([$user->getInternalRemarks(), Date::now()->toDateString() . ': détaché du ménage par ' . User::getCurrent()->getName()]));
                $user->setInternalRemarks($internalRemarks);

                // Create account so the user can top-up money and start purchasing services
                /** @var AccountRepository $accountRepository */
                $accountRepository = _em()->getRepository(Account::class);
                $accountRepository->getOrCreate($user);

                _em()->flush();

                $message = $messageQueuer->queueLeaveFamily($user);
                if ($message) {
                    $mailer->sendMessageAsync($message);
                }

                $message = $messageQueuer->queueAdminLeaveFamily($user);
                if ($message) {
                    $mailer->sendMessageAsync($message);
                }

                return $user;
            },
        ];
    }
}
