<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class TransferAccountBudgets implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'transferAccountBudgets' => fn () => [
            'type' => Type::nonNull(Type::int()),
            'description' => 'Transfer next year account budgets into current budgets',
            'resolve' => function ($root, array $args, SessionInterface $session): int {
                $user = User::getCurrent();
                if (!$user || $user->getRole() !== User::ROLE_ADMINISTRATOR) {
                    throw new Exception('Seul un administrateur peut décaller les budgets');
                }

                /** @var AccountRepository $accountRepository */
                $accountRepository = _em()->getRepository(Account::class);

                return $accountRepository->transferBudgetsToNextYear();
            },
        ];
    }
}
