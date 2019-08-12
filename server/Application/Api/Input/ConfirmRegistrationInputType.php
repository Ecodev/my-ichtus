<?php

declare(strict_types=1);

namespace Application\Api\Input;

use Application\Model\Country;
use GraphQL\Type\Definition\InputObjectType;

class ConfirmRegistrationInputType extends InputObjectType
{
    public function __construct()
    {
        $config = [
            'description' => 'Describe what page we want',
            'fields' => function (): array {
                return [
                    'login' => [
                        'type' => self::nonNull(_types()->get('Login')),
                    ],
                    'password' => [
                        'type' => self::nonNull(_types()->get('Password')),
                    ],
                    'firstName' => [
                        'type' => self::nonNull(self::string()),
                    ],
                    'lastName' => [
                        'type' => self::nonNull(self::string()),
                    ],
                    'street' => [
                        'type' => self::nonNull(self::string()),
                    ],
                    'postcode' => [
                        'type' => self::nonNull(self::string()),
                    ],
                    'locality' => [
                        'type' => self::nonNull(self::string()),
                    ],
                    'country' => [
                        'type' => _types()->getId(Country::class),
                    ],
                    'mobilePhone' => [
                        'type' => self::nonNull(self::string()),
                    ],
                    'birthday' => [
                        'type' => self::nonNull(_types()->get('Date')),
                    ],
                ];
            },
        ];

        parent::__construct($config);
    }
}
