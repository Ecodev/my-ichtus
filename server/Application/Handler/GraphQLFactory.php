<?php

declare(strict_types=1);

namespace Application\Handler;

use Application\Api\Schema;
use Ecodev\Felix\Api\Server;
use Ecodev\Felix\Handler\GraphQLHandler;
use Psr\Container\ContainerInterface;

class GraphQLFactory
{
    public function __invoke(ContainerInterface $container): GraphQLHandler
    {
        $config = $container->get('config');
        $server = new Server(new Schema(), $config['debug']);

        return new GraphQLHandler($server);
    }
}
