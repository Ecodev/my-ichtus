<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\AccountBalance;

final class AccountBalanceLessOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '<';
    }
}
