<?php

declare(strict_types=1);

namespace Application\Api\Input;

use Application\Model\TransactionLine;
use GraphQL\Type\Definition\InputObjectType;

/**
 * The normal `TransactionLineInput`, plus the id of the line when it already exists. Creating a
 * transaction keeps `TransactionLineInput`, which has no id at all, so a line belonging to another
 * transaction cannot even be named there.
 */
class UpdatableTransactionLineInputType extends InputObjectType
{
    public function __construct()
    {
        $config = [
            'description' => 'A line of an existing transaction, identified by its `id` when it already exists',
            'fields' => fn (): array => [
                'id' => [
                    'type' => _types()->getId(TransactionLine::class),
                    'description' => 'The line to update, or nothing at all to create a new line',
                ],
            ] + _types()->getInput(TransactionLine::class)->getFields(),
        ];

        parent::__construct($config);
    }
}
