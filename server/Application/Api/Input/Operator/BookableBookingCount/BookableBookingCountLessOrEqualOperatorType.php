<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookableBookingCount;

final class BookableBookingCountLessOrEqualOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '<=';
    }
}
