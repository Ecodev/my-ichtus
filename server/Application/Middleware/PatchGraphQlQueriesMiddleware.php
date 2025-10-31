<?php

declare(strict_types=1);

namespace Application\Middleware;

use Laminas\Diactoros\CallbackStream;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * TODO revert this entire commit in February 2026.
 */
class PatchGraphQlQueriesMiddleware implements MiddlewareInterface
{
    /**
     * Transform GraphQL queries from old clients to still be compatible with the server new schema.
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $contents = $request->getBody()->getContents();

        // Login mutation does not accept a Login anymore, but a String
        $contents = str_replace('"isActive":{"equal":{"value":true}}', '"status": {"equal": {"value": "Active"}}', $contents);

        return $handler->handle($request->withBody(new CallbackStream(fn () => $contents)));
    }
}
