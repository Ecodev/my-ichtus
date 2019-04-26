#! /usr/bin/env php
<?php

use Application\Service\MessageQueuer;

$container = require_once 'server/cli.php';

/** @var MessageQueuer $messageQueuer */
$messageQueuer = $container->get(MessageQueuer::class);
$count = $messageQueuer->queueNegativeBalance();
_em()->flush();

echo $count . ' messages queued' . PHP_EOL;
