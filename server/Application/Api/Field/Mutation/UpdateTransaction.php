<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Field\FieldInterface;
use Application\Api\Helper;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use GraphQL\Type\Definition\Type;
use Zend\Expressive\Session\SessionInterface;

abstract class UpdateTransaction implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'updateTransaction',
            'type' => Type::nonNull(_types()->getOutput(Transaction::class)),
            'description' => 'Update a transaction, and optionally replace all its transaction lines if given any',
            'args' => [
                'id' => Type::nonNull(_types()->getId(Transaction::class)),
                'input' => Type::nonNull(_types()->getPartialInput(Transaction::class)),
                'lines' => Type::listOf(Type::nonNull(_types()->getInput(TransactionLine::class))),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): Transaction {
                /** @var Transaction $transaction */
                $transaction = $args['id']->getEntity();
                $input = $args['input'];
                Helper::hydrate($transaction, $input);

                // Check ACL
                Helper::throwIfDenied($transaction, 'update');
                $lines = $args['lines'];

                if ($lines !== null) {
                    _em()->getRepository(Transaction::class)->hydrateLinesAndFlush($transaction, $lines);
                } else {
                    // Update the date of each line to match the one of the transaction
                    foreach ($transaction->getTransactionLines() as $line) {
                        $line->setTransactionDate($transaction->getTransactionDate());
                    }
                    _em()->flush();
                }

                return $transaction;
            },
        ];
    }
}
