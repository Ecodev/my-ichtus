<?php

declare(strict_types=1);

use Application\Action\GraphQLAction;
use GraphQL\Upload\UploadMiddleware;
use Psr\Container\ContainerInterface;
use Zend\Expressive\Application;
use Zend\Expressive\Helper\BodyParams\BodyParamsMiddleware;
use Zend\Expressive\MiddlewareFactory;

/**
 * Setup routes with a single request method:
 *
 * $app->get('/', App\Handler\HomePageHandler::class, 'home');
 * $app->post('/album', App\Handler\AlbumCreateHandler::class, 'album.create');
 * $app->put('/album/:id', App\Handler\AlbumUpdateHandler::class, 'album.put');
 * $app->patch('/album/:id', App\Handler\AlbumUpdateHandler::class, 'album.patch');
 * $app->delete('/album/:id', App\Handler\AlbumDeleteHandler::class, 'album.delete');
 *
 * Or with multiple request methods:
 *
 * $app->route('/contact', App\Handler\ContactHandler::class, ['GET', 'POST', ...], 'contact');
 *
 * Or handling all request methods:
 *
 * $app->route('/contact', App\Handler\ContactHandler::class)->setName('contact');
 *
 * or:
 *
 * $app->route(
 *     '/contact',
 *     App\Handler\ContactHandler::class,
 *     Zend\Expressive\Router\Route::HTTP_METHOD_ANY,
 *     'contact'
 * );
 */
return function (Application $app, MiddlewareFactory $factory, ContainerInterface $container): void {
    $app->post('/graphql', [
        BodyParamsMiddleware::class,
        UploadMiddleware::class,
        GraphQLAction::class,
    ], 'graphql');

    $app->get('/image/{id:\d+}[/{maxHeight:\d+}]', [
        \Application\Action\ImageAction::class,
    ], 'image');

    $app->get('/accounting-document/{id:\d+}', [
        \Application\Action\AccountingDocumentAction::class,
    ], 'accounting-document');

    $app->post('/datatrans', [
        BodyParamsMiddleware::class,
        \Application\Action\DatatransAction::class,
    ], 'datatrans');

    $app->get('/export/transactionLines/{key:[0-9a-f]+}/{name:.+\.xlsx}', [
        \Application\Action\ExportTransactionLinesAction::class,
    ], 'transactionsLines');
};
