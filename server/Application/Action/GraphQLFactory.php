<?php

declare(strict_types=1);

namespace Application\Action;

use Application\Api\Schema;
use Ecodev\Felix\Action\GraphQLAction;
use Ecodev\Felix\Api\Server;
use Interop\Container\ContainerInterface;

class GraphQLFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $server = new Server(new Schema(), true);

        return new GraphQLAction($server);
    }
}
