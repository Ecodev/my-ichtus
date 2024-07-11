#! /usr/bin/env php
<?php

declare(strict_types=1);

use Application\Model\Log;
use Application\Repository\LogRepository;

require_once 'server/cli.php';

/** @var LogRepository $logRepository */
$logRepository = _em()->getRepository(Log::class);
$count = $logRepository->deleteOldLogs();

echo "$count logs entry deleted\n";
