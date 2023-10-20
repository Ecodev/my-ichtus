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
$clientConfig['signedQueries']['keys']['app'] = $config['signedQueries']['keys']['app'] ?? '';
$clientConfig['signedQueries']['keys']['navigations'] = $config['signedQueries']['keys']['navigations'] ?? '';

$json = json_encode($clientConfig, JSON_PRETTY_PRINT);
$code = <<<STRING
    /* eslint-disable */
    export const localConfig = $json as const;
    STRING;

file_put_contents('client/app/shared/generated-config.ts', $code);
