<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Interop\Container\ContainerInterface;

class AccountingReportFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $config = $container->get('config');

        return new AccountingReport($config['hostname'], $config['accounting']);
    }
}
