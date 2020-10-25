#! /usr/bin/env php
<?php

/**
 * A script to check that accounts are balanced
 */

use Application\Service\Accounting;

$container = require_once 'server/cli.php';

/** @var Accounting $service */
$accounting = $container->get(Accounting::class);
$hasError = $accounting->check();

exit($hasError ? 1 : 0);
