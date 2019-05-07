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
            \Application\DBAL\Logging\ForwardSQLLogger::class,
        ],
        // Use 'factories' for services provided by callbacks/factory classes.
        'factories' => [
            \Application\Middleware\AuthenticationMiddleware::class => \Application\Middleware\AuthenticationFactory::class,
            'doctrine.entity_manager.orm_default' => \Application\ORM\EntityManagerFactory::class,
            \Application\Action\GraphQLAction::class => \Application\Action\GraphQLFactory::class,
            \GraphQL\Doctrine\Types::class => \Application\Api\TypesFactory::class,
            \Application\Action\ImageAction::class => \Application\Action\ImageFactory::class,
            \Application\Action\AccountingDocumentAction::class => \Application\Action\AccountingDocumentFactory::class,
            \Application\Action\DatatransAction::class => \Application\Action\DatatransFactory::class,
            \Application\Service\ImageResizer::class => \Application\Service\ImageResizerFactory::class,
            \Imagine\Image\ImagineInterface::class => \Application\Service\ImagineFactory::class,
            \Application\Service\Mailer::class => \Application\Service\MailerFactory::class,
            \Application\Service\MessageQueuer::class => \Application\Service\MessageQueuerFactory::class,
            \Application\Service\Invoicer::class => \Application\Service\InvoicerFactory::class,
            \Zend\View\Renderer\RendererInterface::class => \Application\Service\RendererFactory::class,
            \Zend\Mail\Transport\TransportInterface::class => \Application\Service\TransportFactory::class,
            \Zend\Log\LoggerInterface::class => \Application\Log\LoggerFactory::class,
        ],
    ],
];
