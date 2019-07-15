<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Api\Field\FieldInterface;
use Application\Model\Account;
use GraphQL\Type\Definition\Type;

abstract class NextAccountCode implements FieldInterface
{
    public static function build(): array
    {
        return
            [
                'name' => 'nextAccountCode',
                'type' => Type::nonNull(Type::int()),
                'description' => 'Next available account code for creation',
                'args' => [],
                'resolve' => function ($root, array $args): int {
                    /** @var AccountRepository $repository */
                    $repository = _em()->getRepository(Account::class);

                    return $repository->getNextCodeAvailable();
                },
            ];
    }
}
