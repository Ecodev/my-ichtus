#! /usr/bin/env php
<?php

/**
 * A script that generates the closing entries at the end of an accounting period
 * DO A DATABASE BACKUP BEFORE USING THIS SCRIPT IN PRODUCTION.
 */

use Application\Service\Accounting;
use Cake\Chronos\ChronosDate;

$container = require_once 'server/cli.php';

$endDate = $argv[1] ?? null;
if (!$endDate) {
    throw new InvalidArgumentException('Specify the end of the accounting period (YYYY-MM-DD)');
}
$endDate = ChronosDate::createFromFormat('Y-m-d+', $endDate);

/** @var Accounting $accounting */
$accounting = $container->get(Accounting::class);

$output = [];
$transaction = $accounting->close($endDate, $output);

foreach ($output as $line) {
    echo $line . PHP_EOL;
}

if ($transaction) {
    echo 'Transaction #' . $transaction->getId() . ' enregistrée' . PHP_EOL;
}
