#! /usr/bin/env php
<?php

use Application\Model\Log;
use Application\Repository\LogRepository;

require_once 'server/cli.php';

/** @var LogRepository $logRepository */
$logRepository = _em()->getRepository(Log::class);
$count = $logRepository->deleteOldLogs();

echo "$count logs entry deleted\n";
