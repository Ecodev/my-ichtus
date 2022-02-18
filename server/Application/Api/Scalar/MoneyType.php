<?php

declare(strict_types=1);

namespace Application\Api\Scalar;

use Ecodev\Felix\Api\Scalar\AbstractMoneyType;
use Money\Money;

class MoneyType extends AbstractMoneyType
{
    /**
     * @param numeric-string $value
     */
    protected function createMoney(string $value): Money
    {
        return Money::CHF($value);
    }
}
