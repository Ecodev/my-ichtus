<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Api\Exception;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use GraphQL\Doctrine\Definition\Operator\AbstractOperator;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\LeafType;

class SearchOperatorType extends AbstractOperator
{
    protected function getConfiguration(LeafType $leafType): array
    {
        return [
            'fields' => [
                [
                    'name' => 'value',
                    'type' => self::nonNull($leafType),
                ],
            ],
        ];
    }

    public function getDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $field, ?array $args): ?string
    {
        if (!$args) {
            return null;
        }

        $words = preg_split('/[[:space:]]+/', $args['value'], -1, PREG_SPLIT_NO_EMPTY);
        if (!$words) {
            return null;
        }

        $fields = $this->getSearchableFields($metadata, $alias);

        // Special case for Booking, search in related objects
        if ($metadata->getName() === Booking::class) {
            $fields = array_merge(
                $fields,
                $this->searchOnJoinedEntity($uniqueNameFactory, $metadata, $queryBuilder, $alias, 'owner'),
                $this->searchOnJoinedEntity($uniqueNameFactory, $metadata, $queryBuilder, $alias, 'bookable')
            );
        }

        return $this->buildSearchDqlCondition($uniqueNameFactory, $metadata, $queryBuilder, $fields, $words);
    }

    private function getSearchableFields(ClassMetadata $metadata, string $alias): array
    {
        $whitelistedFields = [
            'firstName',
            'lastName',
            'name',
            'locality',
            'email',
            'destination',
            'startComment',
            'endComment',
            'code',
            'message',
        ];

        // Find most textual fields for the entity
        $fields = [];
        foreach ($metadata->fieldMappings as $mapping) {
            if (in_array($mapping['fieldName'], $whitelistedFields, true)) {
                $fieldName = $mapping['fieldName'];
                $field = $alias . '.' . $fieldName;

                $fields[] = $field;
            }
        }

        if (!$fields) {
            throw new Exception('Cannot find fields to search on for entity ' . $metadata->name);
        }

        return $fields;
    }

    /**
     * Add a join and return searchable fields in order to search on a joined entity
     *
     * @param UniqueNameFactory $uniqueNameFactory
     * @param ClassMetadata $metadata
     * @param QueryBuilder $queryBuilder
     * @param string $alias
     * @param string $fieldName
     *
     * @return string[]
     */
    private function searchOnJoinedEntity(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, string $alias, string $fieldName): array
    {
        $association = $metadata->getAssociationMapping($fieldName);
        $targetEntity = $association['targetEntity'];

        $joinedMetadata = $queryBuilder->getEntityManager()->getMetadataFactory()->getMetadataFor($targetEntity);
        $joinedAlias = $uniqueNameFactory->createAliasName($targetEntity);

        $queryBuilder->leftJoin($alias . '.' . $fieldName, $joinedAlias, Join::WITH);

        return $this->getSearchableFields($joinedMetadata, $joinedAlias);
    }

    /**
     * Return a DQL condition to search each of the words in any of the fields
     *
     * @param UniqueNameFactory $uniqueNameFactory
     * @param ClassMetadata $metadata
     * @param QueryBuilder $queryBuilder
     * @param array $fields
     * @param array $words
     *
     * @return string
     */
    private function buildSearchDqlCondition(UniqueNameFactory $uniqueNameFactory, ClassMetadata $metadata, QueryBuilder $queryBuilder, array $fields, array $words): string
    {
        if (!$fields) {
            throw new Exception('Cannot find fields to search on for entity ' . $metadata->name);
        }

        $wordWheres = [];

        foreach ($words as $i => $word) {
            $parameterName = $uniqueNameFactory->createParameterName();

            $fieldWheres = [];
            foreach ($fields as $field) {
                $fieldWheres[] = $field . ' LIKE :' . $parameterName;
            }

            if ($fieldWheres) {
                $wordWheres[] = '(' . implode(' OR ', $fieldWheres) . ')';
                $queryBuilder->setParameter($parameterName, '%' . $word . '%');
            }
        }

        return implode(' AND ', $wordWheres);
    }
}
