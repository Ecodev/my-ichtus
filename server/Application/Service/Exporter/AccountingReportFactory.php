<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Psr\Container\ContainerInterface;

class AccountingReportFactory
{
    public function __invoke(ContainerInterface $container): AccountingReport
    {
        $config = $container->get('config');

        return new AccountingReport($config['hostname'], $config['accounting']);
    }
}
