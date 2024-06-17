<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Model\TransactionLine;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class ReconcileTransactionLine implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'reconcileTransactionLine' => fn () => [
            'type' => Type::nonNull(_types()->getOutput(TransactionLine::class)),
            'description' => 'Update the reconcile flag of a line of transaction',
            'args' => [
                'id' => Type::nonNull(_types()->getId(TransactionLine::class)),
                'isReconciled' => Type::nonNull(Type::boolean()),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): TransactionLine {
                /** @var TransactionLine $line */
                $line = $args['id']->getEntity();
                $isReconciled = (bool) $args['isReconciled'];

                // Check ACL
                Helper::throwIfDenied($line->getTransaction(), 'update');
                $line->setIsReconciled($isReconciled);

                _em()->flush();

                return $line;
            },
        ];
    }
}
