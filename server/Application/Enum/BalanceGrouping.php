<?php

declare(strict_types=1);

namespace Application\Enum;

/**
 * How `AccountRepository::getAccountsBalances()` aggregates the accounts it returns.
 */
enum BalanceGrouping
{
    /**
     * One row per account and per type of its descendants, so a group whose descendants mix
     * several types is returned once for each of them.
     */
    case PerType;

    /**
     * One row per account. A group whose descendants mix revenue and expense is a revenue, and
     * one that mixes incompatible types has neither type nor balance.
     */
    case PerAccount;
}
