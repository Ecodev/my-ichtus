<?php

declare(strict_types=1);

namespace Application\Action;

use Interop\Container\ContainerInterface;

class ExportTransactionLinesFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $config = $container->get('config');

        return new ExportTransactionLinesAction($config['hostname']);
    }
}
