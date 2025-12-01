<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\HasCreditOnDate;

final class HasCreditOnDateGreaterOrEqualOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '>=';
    }
}
