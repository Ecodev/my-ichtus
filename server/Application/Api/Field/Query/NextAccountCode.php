<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Model\Account;
use Application\Repository\AccountRepository;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;

abstract class NextAccountCode implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'nextAccountCode' => fn () => [
            'type' => Type::nonNull(Type::int()),
            'description' => 'Next available account code for creation',
            'args' => [
                'parent' => _types()->getId(Account::class),
            ],
            'resolve' => function ($root, array $args): int {
                /** @var AccountRepository $repository */
                $repository = _em()->getRepository(Account::class);

                return $repository->getNextCodeAvailable($args['parent']?->getEntity());
            },
        ];
    }
}
