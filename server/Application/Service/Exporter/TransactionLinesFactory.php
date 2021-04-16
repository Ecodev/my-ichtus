<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Interop\Container\ContainerInterface;

class TransactionLinesFactory
{
    public function __invoke(ContainerInterface $container): TransactionLines
    {
        $config = $container->get('config');

        return new TransactionLines($config['hostname']);
    }
}
