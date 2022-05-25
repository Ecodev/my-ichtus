#! /usr/bin/env php
<?php

$container = require_once 'server/cli.php';

$config = $container->get('config');

$clientKeys = [
    'datatrans',
    'accounting',
];

$clientConfig = array_intersect_key($config, array_flip($clientKeys));
$clientConfig['log']['url'] = $config['log']['url'];

$json = json_encode($clientConfig, JSON_PRETTY_PRINT);
$code = <<<STRING
    /* eslint-disable */
    /* eslint-disable */
    export const localConfig = $json;
    STRING;

file_put_contents('client/app/shared/generated-config.ts', $code);
