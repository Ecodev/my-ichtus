#! /usr/bin/env php
<?php

/**
 * Make sure users have an (transaction) account,
 * or are owned by a user who has one
 */

use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\UserRepository;

require_once 'server/cli.php';

/** @var UserRepository $userRepository */
$userRepository = _em()->getRepository(User::class);

/** @var AccountRepository $accountRepository */
$accountRepository = _em()->getRepository(Account::class);

foreach ($userRepository->getAllFamilyOwners() as $user) {
    echo sprintf('User#%d (%s)', $user->getId(), $user->getName()) . PHP_EOL;
    if (!$user->getAccount()) {
        $account = $accountRepository->getOrCreate($user);
        echo sprintf('Création du compte %d pour l\'utilisateur %d...', $account->getCode(), $user->getId()) . PHP_EOL;
        _em()->flush();
    }
}
