<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\AccountBalance;

use Application\Model\Account;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

abstract class AbstractOperatorType extends AbstractOperator
{
    abstract protected function getDqlOperator(): string;

    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter the users by the account balance',
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::nonNull(_types()->get('Money')),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }
        $balance = $args['value'];

        $accountAlias = $uniqueNameFactory->createAliasName(Account::class);
        $param = $uniqueNameFactory->createParameterName();

        $queryBuilder->innerJoin($alias . '.accounts', $accountAlias);

        $queryBuilder->setParameter($param, (int) $balance);

        return $accountAlias . '.balance ' . $this->getDqlOperator() . ' :' . $param . '';
    }
}
