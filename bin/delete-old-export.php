#! /usr/bin/env php
<?php
$result_code = 0;

// Delete export files older than one week
passthru("find htdocs/data/export/ -mindepth 1 -not -path 'htdocs/data/export/.gitkeep' -mtime +7 -delete", $result_code);

exit($result_code);
