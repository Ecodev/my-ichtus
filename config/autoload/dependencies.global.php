<?php

declare(strict_types=1);

return [
    // Provides application-wide services.
    // We recommend using fully-qualified class names whenever possible as
    // service names.
    'dependencies' => [
        // Use 'aliases' to alias a service name to another service. The
        // key is the alias name, the value is the service to which it points.
        'aliases' => [
            \Doctrine\ORM\EntityManager::class => 'doctrine.entity_manager.orm_default',
        ],
        // Use 'invokables' for constructor-less services, or services that do
        // not require arguments to the constructor. Map a service name to the
        // class name.
        'invokables' => [
            \Doctrine\ORM\Mapping\UnderscoreNamingStrategy::class => \Doctrine\ORM\Mapping\UnderscoreNamingStrategy::class,
        ],
        // Use 'factories' for services provided by callbacks/factory classes.
        'factories' => [
            'doctrine.entity_manager.orm_default' => \Application\ORM\EntityManagerFactory::class,
            \Application\Handler\AccountingDocumentHandler::class => \Application\Handler\AccountingDocumentFactory::class,
            \Application\Handler\DatatransHandler::class => \Application\Handler\DatatransFactory::class,
            \Application\Middleware\AuthenticationMiddleware::class => \Application\Middleware\AuthenticationFactory::class,
            \Application\Service\Accounting::class => \Application\Service\AccountingFactory::class,
            \Application\Service\Exporter\AccountingReport::class => \Application\Service\Exporter\AccountingReportFactory::class,
            \Application\Service\Exporter\TransactionLines::class => \Application\Service\Exporter\TransactionLinesFactory::class,
            \Application\Service\Invoicer::class => \Application\Service\InvoicerFactory::class,
            \Application\Service\MessageQueuer::class => \Application\Service\MessageQueuerFactory::class,
            \Ecodev\Felix\Handler\GraphQLHandler::class => \Application\Handler\GraphQLFactory::class,
            \Ecodev\Felix\Handler\ImageHandler::class => \Application\Handler\ImageFactory::class,
            \Ecodev\Felix\Log\Writer\Db::class => \Application\Log\DbWriterFactory::class,
            \Ecodev\Felix\Service\Mailer::class => \Application\Service\MailerFactory::class,
            \GraphQL\Doctrine\Types::class => \Application\Api\TypesFactory::class,
        ],
    ],
];
