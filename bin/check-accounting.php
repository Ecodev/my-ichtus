#! /usr/bin/env php
<?php

/**
 * A script to check that accounts are balanced
 */
use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Application\Model\Transaction;
use Money\Currencies\ISOCurrencies;
use Money\Formatter\DecimalMoneyFormatter;

require_once 'server/cli.php';

$currencies = new ISOCurrencies();
$moneyFormatter = new DecimalMoneyFormatter($currencies);
$repo = _em()->getRepository(Account::class);

$assets = $repo->totalBalanceByType(AccountTypeType::ASSET);
$liabilities = $repo->totalBalanceByType(AccountTypeType::LIABILITY);
$revenue = $repo->totalBalanceByType(AccountTypeType::REVENUE);
$expense = $repo->totalBalanceByType(AccountTypeType::EXPENSE);
$equity = $repo->totalBalanceByType(AccountTypeType::EQUITY);

$income = $revenue->subtract($expense);

$discrepancy = $assets->subtract($income)->subtract($liabilities->add($equity));

echo '
Produits  : ' . $moneyFormatter->format($revenue) . '
Charges   : ' . $moneyFormatter->format($expense) . '
' . ($income->isNegative() ? 'Déficit   : ' : 'Bénéfice  : ') . $moneyFormatter->format($income) . '
Actifs    : ' . $moneyFormatter->format($assets) . '
Passifs   : ' . $moneyFormatter->format($liabilities) . '
Capital   : ' . $moneyFormatter->format($equity) . '
Écart     : ' . $moneyFormatter->format($discrepancy) . PHP_EOL;

$errors = [];

if (!$discrepancy->isZero()) {
    $errors[] = sprintf('ERREUR: écart de %s au bilan des comptes!', $discrepancy);
}

foreach (_em()->getRepository(Transaction::class)->findAll() as $transaction) {
    try {
        $transaction->checkBalance();
    } catch (Throwable $e) {
        $errors[] = $e->getMessage();
    }
}

if (count($errors)) {
    echo PHP_EOL . implode(PHP_EOL, $errors) . PHP_EOL . PHP_EOL;
    exit(1);
}
