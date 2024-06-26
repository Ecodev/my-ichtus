<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Repository\TransactionRepository;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class CreateTransaction implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'createTransaction' => fn () => [
            'type' => Type::nonNull(_types()->getOutput(Transaction::class)),
            'description' => 'Create a transaction with all its transaction lines',
            'args' => [
                'input' => Type::nonNull(_types()->getInput(Transaction::class)),
                'lines' => Type::nonNull(Type::listOf(Type::nonNull(_types()->getInput(TransactionLine::class)))),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): Transaction {
                // Do it
                $transaction = new Transaction();
                $input = $args['input'];
                Helper::hydrate($transaction, $input);

                // Check ACL
                Helper::throwIfDenied($transaction, 'create');
                $lines = $args['lines'];

                /** @var TransactionRepository $transactionRepository */
                $transactionRepository = _em()->getRepository(Transaction::class);
                $transactionRepository->hydrateLinesAndFlush($transaction, $lines);

                return $transaction;
            },
        ];
    }
}
