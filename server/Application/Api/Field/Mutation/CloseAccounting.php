<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Model\Transaction;
use Application\Model\User;
use Application\Service\Accounting;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Api\Scalar\DateType;
use Mezzio\Session\SessionInterface;

abstract class CloseAccounting implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'closeAccounting' => fn () => [
            'type' => _types()->getOutput(Transaction::class),
            'description' => 'Generate the closing entries at the end of an accounting period',
            'args' => [
                'date' => _types()->get(DateType::class),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): ?Transaction {
                global $container;

                $user = User::getCurrent();
                if (!$user || $user->getRole() !== User::ROLE_ADMINISTRATOR) {
                    throw new Exception('Seul un administrateur peut effectuer le bouclement comptable');
                }

                /** @var Accounting $accounting */
                $accounting = $container->get(Accounting::class);

                if ($args['date']) {
                    $transaction = $accounting->close($args['date']);

                    return $transaction;
                }

                throw new Exception('Date de bouclement invalide');
            },
        ];
    }
}
