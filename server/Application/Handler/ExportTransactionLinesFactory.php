<?php

declare(strict_types=1);

namespace Application\Handler;

use Interop\Container\ContainerInterface;

class ExportTransactionLinesFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $config = $container->get('config');

        return new ExportTransactionLinesHandler($config['hostname']);
    }
}
