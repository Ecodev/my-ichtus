<?php

declare(strict_types=1);

return [
    'doctrine' => [
        'connection' => [
            'orm_default' => [
                'driverClass' => Doctrine\DBAL\Driver\PDO\MySQL\Driver::class,
                'params' => [
                    'host' => 'localhost',
                    'dbname' => 'ichtus',
                    'user' => 'ichtus',
                    'password' => '',
                    'port' => 3306,
                    'driverOptions' => [
                        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4',
                    ],
                    'defaultTableOptions' => [
                        'charset' => 'utf8mb4',
                        'collate' => 'utf8mb4_unicode_ci',
                    ],
                ],
            ],
        ],
        'driver' => [
            'orm_default' => [
                'class' => Doctrine\ORM\Mapping\Driver\AttributeDriver::class,
                'cache' => 'array',
                'paths' => ['server/Application/Model'],
            ],
        ],
        'configuration' => [
            'orm_default' => [
                'naming_strategy' => Doctrine\ORM\Mapping\UnderscoreNamingStrategy::class,
                'proxy_dir' => 'data/cache/DoctrineORMModule/Proxy',
                'generate_proxies' => false,
                'filters' => [
                    Ecodev\Felix\ORM\Query\Filter\AclFilter::class => Ecodev\Felix\ORM\Query\Filter\AclFilter::class,
                ],
                'datetime_functions' => [],
                'string_functions' => [
                    'if' => DoctrineExtensions\Query\Mysql\IfElse::class,
                    'ifnull' => DoctrineExtensions\Query\Mysql\IfNull::class,
                ],
                'numeric_functions' => [
                    'native_in' => Ecodev\Felix\ORM\Query\NativeIn::class,
                ],
            ],
        ],
        'types' => [
            'UserRole' => Application\DBAL\Types\UserRoleType::class,
            'UserStatus' => Application\DBAL\Types\UserStatusType::class,
            'BookableState' => Application\DBAL\Types\BookableStateType::class,
            'BookingType' => Application\DBAL\Types\BookingTypeType::class,
            'BookingStatus' => Application\DBAL\Types\BookingStatusType::class,
            'Relationship' => Application\DBAL\Types\RelationshipType::class,
            'BillingType' => Application\DBAL\Types\BillingTypeType::class,
            'datetime' => Ecodev\Felix\DBAL\Types\ChronosType::class,
            'date' => Ecodev\Felix\DBAL\Types\DateType::class,
            'Money' => Application\DBAL\Types\MoneyType::class,
            'ExpenseClaimStatus' => Application\DBAL\Types\ExpenseClaimStatusType::class,
            'ExpenseClaimType' => Application\DBAL\Types\ExpenseClaimTypeType::class,
            'MessageType' => Application\DBAL\Types\MessageTypeType::class,
            'AccountType' => Application\DBAL\Types\AccountTypeType::class,
            'SwissSailingType' => Application\DBAL\Types\SwissSailingTypeType::class,
            'SwissWindsurfType' => Application\DBAL\Types\SwissWindsurfTypeType::class,
        ],
        // migrations configuration
        'migrations' => [
            'orm_default' => [
                'table_storage' => [
                    'table_name' => 'doctrine_migration_versions',
                ],
                'custom_template' => 'config/migration-template.txt',
                'migrations_paths' => [
                    'Application\Migration' => 'server/Application/Migration',
                ],
            ],
        ],
    ],
];
