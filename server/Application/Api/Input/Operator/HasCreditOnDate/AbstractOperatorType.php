<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\HasCreditOnDate;

use Cake\Chronos\ChronosDate;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\ORM\Query\NativeIn;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

abstract class AbstractOperatorType extends AbstractOperator
{
    abstract protected function getDqlOperator(): string;

    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the users by the date they credited their account',
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::nonNull(_types()->get(ChronosDate::class)),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        /** @var ChronosDate $date */
        $date = $args['value'];
        $date = _em()->getConnection()->quote($date->toDateString());

        $dqlOperator = $this->getDqlOperator();

        return NativeIn::dql(
            $alias . '.id',
            <<<SQL
                SELECT account.owner_id FROM transaction_line
                INNER JOIN account ON transaction_line.credit_id = account.id
                WHERE
                    account.owner_id IS NOT NULL
                    AND DATE(transaction_date) $dqlOperator $date
                SQL
        );
    }
}
