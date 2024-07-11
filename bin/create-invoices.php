#! /usr/bin/env php
<?php

declare(strict_types=1);

use Application\Service\Invoicer;

$container = require_once 'server/cli.php';

/** @var Invoicer $invoicer */
$invoicer = $container->get(Invoicer::class);
$count = $invoicer->invoicePeriodic();
_em()->flush();

echo $count . ' invoices created' . PHP_EOL;
