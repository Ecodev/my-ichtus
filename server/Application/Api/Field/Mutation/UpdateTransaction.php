<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Api\Input\UpdatableTransactionLineInputType;
use Application\Model\Transaction;
use Application\Repository\TransactionRepository;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class UpdateTransaction implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'updateTransaction' => fn () => [
            'type' => Type::nonNull(_types()->getOutput(Transaction::class)),
            'description' => "Update a transaction, sync all it's lines if given",
            'args' => [
                'id' => Type::nonNull(_types()->getId(Transaction::class)),
                'input' => Type::nonNull(_types()->getPartialInput(Transaction::class)),
                'lines' => Type::listOf(Type::nonNull(_types()->get(UpdatableTransactionLineInputType::class))),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): Transaction {
                /** @var Transaction $transaction */
                $transaction = $args['id']->getEntity();
                $input = $args['input'];
                Helper::hydrate($transaction, $input);

                // Check ACL
                Helper::throwIfDenied($transaction, 'update');

                $lines = $args['lines'] ?? null;

                if ($lines !== null) {
                    /** @var TransactionRepository $transactionRepository */
                    $transactionRepository = _em()->getRepository(Transaction::class);
                    $transactionRepository->hydrateLinesAndFlush($transaction, $lines);
                    _em()->refresh($transaction);
                } else {
                    _em()->flush();
                }

                return $transaction;
            },
        ];
    }
}
