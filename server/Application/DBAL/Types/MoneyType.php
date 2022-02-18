<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\AbstractMoneyType;
use Money\Money;

class MoneyType extends AbstractMoneyType
{
    public function getName(): string
    {
        return 'Money';
    }

    /**
     * @param numeric-string $value
     */
    protected function createMoney(string $value): Money
    {
        return Money::CHF($value);
    }
}
