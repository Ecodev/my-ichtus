<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Enum\AccountWhere;
use Application\Model\Account;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use Ecodev\Felix\Utility;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class AccountOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'description' => 'Filter transaction lines affecting the given accounts in debit, or credit, or both',
            'fields' => [
                [
                    'name' => 'values',
                    'type' => self::listOf(self::nonNull($this->types->getId(Account::class))),
                    'defaultValue' => [],
                ],
                [
                    'name' => 'not',
                    'type' => self::boolean(),
                    'defaultValue' => false,
                ],
                [
                    'name' => 'recursive',
                    'type' => self::boolean(),
                    'defaultValue' => false,
                ],
                [
                    'name' => 'where',
                    'type' => _types()->get(AccountWhere::class),
                    'defaultValue' => AccountWhere::DebitOrCredit,
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): string
    {
        if (!$args) {
            return '';
        }

        $ids = Utility::modelToId($args['values']);

        if ($ids === null) {
            return '';
        }

        /** @var bool $recursive */
        $recursive = $args['recursive'];

        $where = AccountWhere::from($args['where']);

        /** @var bool $not */
        $not = $args['not'];

        if ($recursive) {
            $ids = _em()->getRepository(Account::class)->getSelfAndDescendants($ids);
        }

        // Lines NOT affecting any account
        if (empty($ids) && !$not) {
            return $this->applyWhere($alias, $where, true, 'IS NULL');
        }

        // Lines affecting ANY account
        if (empty($ids)) {
            return $this->applyWhere($alias, $where, false, 'IS NOT NULL');
        }

        $parameterName = $uniqueNameFactory->createParameterName();
        $queryBuilder->setParameter($parameterName, $ids);

        // Lines NOT affecting any of those accounts
        if ($not) {
            return $this->applyWhere($alias, $where, true, 'NOT IN (:' . $parameterName . ')');
        }

        // Lines affecting one of those accounts
        return $this->applyWhere($alias, $where, false, 'IN (:' . $parameterName . ')');
    }

    private function applyWhere(string $alias, AccountWhere $where, bool $isAnd, string $condition): string
    {
        $parts = [];
        if ($where === AccountWhere::DebitOrCredit || $where === AccountWhere::Debit) {
            $parts[] = $alias . '.debit ' . $condition;
        }
        if ($where === AccountWhere::DebitOrCredit || $where === AccountWhere::Credit) {
            $parts[] = $alias . '.credit ' . $condition;
        }

        return implode($isAnd ? ' AND ' : ' OR ', $parts);
    }
}
