<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Model\Transaction;
use Application\Model\User;
use Application\Repository\TransactionRepository;
use Cake\Chronos\ChronosDate;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\Field\FieldInterface;

abstract class LastClosingDate implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'lastClosingDate' => fn () => [
            'type' => _types()->get(ChronosDate::class),
            'description' => 'Return the last accounting closing date, if any',
            'resolve' => function ($root, array $args): ?ChronosDate {
                if (!User::getCurrent()) {
                    throw new Exception('Denied to anonymous');
                }

                /** @var TransactionRepository $transactionRepository */
                $transactionRepository = _em()->getRepository(Transaction::class);

                return $transactionRepository->getLastClosingDate();
            },
        ];
    }
}
