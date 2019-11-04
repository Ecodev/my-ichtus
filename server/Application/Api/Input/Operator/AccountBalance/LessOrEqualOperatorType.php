<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\AccountBalance;

final class LessOrEqualOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return  '<=';
    }
}
