<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\DBAL\Types\RelationshipType;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Ecodev\Felix\Api\Field\FieldInterface;
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

                // Create account so the user can top-up money and start purchasing services
                /** @var AccountRepository $accountRepository */
                $accountRepository = _em()->getRepository(Account::class);
                $accountRepository->getOrCreate($user);

                _em()->flush();

                return $user;
            },
        ];
    }
}
