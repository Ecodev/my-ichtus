#! /usr/bin/env php
<?php

declare(strict_types=1);

use Application\Model\IndicatorDefinition;

$container = require_once 'server/cli.php';

/** @var Application\Repository\IndicatorDefinitionRepository $repo */
$repo = _em()->getRepository(IndicatorDefinition::class);

if ($repo->insertMissingIndicatorDefinition()) {
    echo 'Inserted accounting indicator definitions' . PHP_EOL;
}
