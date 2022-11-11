<?php

declare(strict_types=1);

namespace Application\Api\Output;

use Application\Acl\Acl;
use Application\Model\AbstractModel;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\ResolveInfo;

class CrudPermissionsListType extends ObjectType
{
    public function __construct()
    {
        $config = [
            'name' => 'CrudPermissionsList',
            'description' => 'Describe global permissions for currently logged in user',
            'fields' => function (): array {
                $crudPermissions = $this->getAllModelResources();

                $fields = [];
                foreach ($crudPermissions as $key => $class) {
                    $fields[$key] = [
                        'type' => self::nonNull(_types()->get(CrudPermissionsType::class)),
                        'resolve' => function (array $root, array $args, $context, ResolveInfo $info) use ($class): array {
                            // Complete root with the model type and forward it
                            $root['type'] = $class;

                            return $root;
                        },
                    ];
                }

                return $fields;
            },
        ];

        parent::__construct($config);
    }

    /**
     * Returns a list of all resources that are model names.
     *
     * @return string[]
     */
    private function getAllModelResources(): array
    {
        $acl = new Acl();
        $result = [];
        foreach ($acl->getResources() as $resource) {
            if (is_a($resource, AbstractModel::class, true)) {
                $className = (string) $resource;
                $parts = explode('\\', $className);
                $key = lcfirst(end($parts));

                $result[$key] = $className;
            }
        }

        return $result;
    }
}
