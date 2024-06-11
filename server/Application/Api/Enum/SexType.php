<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use GraphQL\Type\Definition\EnumType;

class SexType extends EnumType
{
    public function __construct()
    {
        $config = [
            'name' => 'Sex',
            'description' => 'Genders',
            'values' => [
                'not_known' => [
                    'value' => 0,
                    'description' => 'Inconnu',
                ],
                'male' => [
                    'value' => 1,
                    'description' => 'Masculin',
                ],
                'female' => [
                    'value' => 2,
                    'description' => 'Féminin',
                ],
            ],
        ];

        parent::__construct($config);
    }
}
