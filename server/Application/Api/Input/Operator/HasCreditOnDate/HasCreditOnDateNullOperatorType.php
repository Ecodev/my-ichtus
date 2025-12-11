<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\HasCreditOnDate;

use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\ORM\Query\NativeIn;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

final class HasCreditOnDateNullOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the users whether they ever credited their account',
            'fields' => [
                [
                    'name' => 'not',
                    'type' => self::boolean(),
                    'defaultValue' => false,
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        return NativeIn::dql(
            $alias . '.id',
            <<<SQL
                SELECT account.owner_id FROM transaction_line
                INNER JOIN account ON transaction_line.credit_id = account.id
                WHERE
                    account.owner_id IS NOT NULL
                SQL,
            !$args['not'],
        );
    }
}
