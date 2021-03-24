#! /usr/bin/env php
<?php

/**
 * Delete unconfirmed registrations older than a few days
 */

use Application\Model\User;
use Application\Repository\UserRepository;

require_once 'server/cli.php';

/** @var UserRepository $userRepository */
$userRepository = _em()->getRepository(User::class);

$deleted = $userRepository->deleteOldRegistrations();

echo sprintf('%d inscriptions non-confirmées effacées', $deleted) . PHP_EOL;
