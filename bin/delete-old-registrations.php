#! /usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Delete unconfirmed registrations older than a few days.
 */

use Application\Model\User;
use Application\Repository\UserRepository;

require_once 'server/cli.php';

/** @var UserRepository $userRepository */
$userRepository = _em()->getRepository(User::class);

$deleted = $userRepository->deleteOldRegistrations();

if ($deleted) {
    echo sprintf('%d inscriptions non-confirmées effacées', $deleted) . PHP_EOL;
}
