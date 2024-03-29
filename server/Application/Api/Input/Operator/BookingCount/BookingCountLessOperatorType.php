<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookingCount;

final class BookingCountLessOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '<';
    }
}
