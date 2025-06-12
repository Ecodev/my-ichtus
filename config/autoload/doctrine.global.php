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
        'event_manager' => [
            'orm_default' => [
                'subscribers' => [
                    Application\Service\TransactionChecker::class,
                ],
            ],
        ],
        'configuration' => [
            'orm_default' => [
                'naming_strategy' => Doctrine\ORM\Mapping\UnderscoreNamingStrategy::class,
                'proxy_dir' => getcwd() . '/data/cache/DoctrineORMModule/Proxy',
                'auto_generate_proxy_classes' => Doctrine\ORM\Proxy\ProxyFactory::AUTOGENERATE_NEVER,
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
            'datetime' => Ecodev\Felix\DBAL\Types\ChronosType::class,
            'date' => Ecodev\Felix\DBAL\Types\DateType::class,
            'Money' => Application\DBAL\Types\MoneyType::class,
            'MessageType' => Application\DBAL\Types\MessageTypeType::class,
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
