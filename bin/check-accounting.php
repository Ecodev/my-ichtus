#! /usr/bin/env php
<?php

/**
 * A script to check that accounts are balanced
 */

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\User;
use Ecodev\Felix\Format;

require_once 'server/cli.php';

$repo = _em()->getRepository(Account::class);

// Update all accounts' balance from transactions
$repo->updateAccountBalance();

$assets = $repo->totalBalanceByType(AccountTypeType::ASSET);
$liabilities = $repo->totalBalanceByType(AccountTypeType::LIABILITY);
$revenue = $repo->totalBalanceByType(AccountTypeType::REVENUE);
$expense = $repo->totalBalanceByType(AccountTypeType::EXPENSE);
$equity = $repo->totalBalanceByType(AccountTypeType::EQUITY);

$income = $revenue->subtract($expense);

$discrepancy = $assets->subtract($income)->subtract($liabilities->add($equity));

echo '
Produits  : ' . Format::money($revenue) . '
Charges   : ' . Format::money($expense) . '
' . ($income->isNegative() ? 'Déficit   : ' : 'Bénéfice  : ') . Format::money($income) . '
Actifs    : ' . Format::money($assets) . '
Passifs   : ' . Format::money($liabilities) . '
Capital   : ' . Format::money($equity) . '
Écart     : ' . Format::money($discrepancy) . PHP_EOL;

$errors = [];

if (!$discrepancy->isZero()) {
    $errors[] = sprintf('ERREUR: écart de %s au bilan des comptes', Format::money($discrepancy));
}

foreach (_em()->getRepository(Transaction::class)->findAll() as $transaction) {
    try {
        $transaction->checkBalance();
    } catch (Throwable $e) {
        $errors[] = $e->getMessage();
    }
}

foreach (_em()->getRepository(User::class)->getAllNonFamilyOwnersWithAccount() as $user) {
    $errors[] = sprintf(
        'User#%d (%s) ne devrait pas avoir son propre compte débiteur mais partager celui du User#%d (%s)',
        $user->getId(),
        $user->getName(),
        $user->getOwner()->getId(),
        $user->getOwner()->getName()
    );
}

if (count($errors)) {
    echo PHP_EOL . implode(PHP_EOL, $errors) . PHP_EOL . PHP_EOL;
    exit(1);
}
