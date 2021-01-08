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
            \Ecodev\Felix\DBAL\Logging\ForwardSQLLogger::class,
            \Ecodev\Felix\Log\Formatter\Extras::class,
        ],
        // Use 'factories' for services provided by callbacks/factory classes.
        'factories' => [
            \Application\Middleware\AuthenticationMiddleware::class => \Application\Middleware\AuthenticationFactory::class,
            'doctrine.entity_manager.orm_default' => \Application\ORM\EntityManagerFactory::class,
            \Ecodev\Felix\Handler\GraphQLHandler::class => \Application\Handler\GraphQLFactory::class,
            \GraphQL\Doctrine\Types::class => \Application\Api\TypesFactory::class,
            \Ecodev\Felix\Handler\ImageHandler::class => \Application\Handler\ImageFactory::class,
            \Application\Handler\AccountingDocumentHandler::class => \Application\Handler\AccountingDocumentFactory::class,
            \Application\Handler\DatatransHandler::class => \Application\Handler\DatatransFactory::class,
            \Application\Handler\ExportTransactionLinesHandler::class => \Application\Handler\ExportTransactionLinesFactory::class,
            \Application\Handler\ExportAccountingReportHandler::class => \Application\Handler\ExportAccountingReportFactory::class,
            \Ecodev\Felix\Service\ImageResizer::class => \Ecodev\Felix\Service\ImageResizerFactory::class,
            \Imagine\Image\ImagineInterface::class => \Ecodev\Felix\Service\ImagineFactory::class,
            \Ecodev\Felix\Service\Mailer::class => \Application\Service\MailerFactory::class,
            \Application\Service\MessageQueuer::class => \Application\Service\MessageQueuerFactory::class,
            \Application\Service\Invoicer::class => \Application\Service\InvoicerFactory::class,
            \Application\Service\Accounting::class => \Application\Service\AccountingFactory::class,
            \Laminas\View\Renderer\RendererInterface::class => \Ecodev\Felix\Service\RendererFactory::class,
            \Laminas\Mail\Transport\TransportInterface::class => \Ecodev\Felix\Service\TransportFactory::class,
            \Ecodev\Felix\Log\Writer\Db::class => \Application\Log\DbWriterFactory::class,
            \Ecodev\Felix\Log\Writer\Mail::class => \Ecodev\Felix\Log\Writer\MailFactory::class,
            \Ecodev\Felix\Log\EventCompleter::class => \Ecodev\Felix\Log\EventCompleterFactory::class,
            \Laminas\Log\LoggerInterface::class => \Ecodev\Felix\Log\LoggerFactory::class,
            \Ecodev\Felix\Service\MessageRenderer::class => \Ecodev\Felix\Service\MessageRendererFactory::class,
        ],
    ],
];
