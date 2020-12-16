<?php

declare(strict_types=1);

namespace Application\Handler;

use Application\Api\Schema;
use Ecodev\Felix\Api\Server;
use Ecodev\Felix\Handler\GraphQLHandler;
use Interop\Container\ContainerInterface;

class GraphQLFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $server = new Server(new Schema(), true);

        return new GraphQLHandler($server);
    }
}
