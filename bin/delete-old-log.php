#! /usr/bin/env php
<?php

use Application\Model\Log;

require_once 'server/cli.php';

$count = _em()->getRepository(Log::class)->deleteOldLogs();

echo "$count logs entry deleted\n";
