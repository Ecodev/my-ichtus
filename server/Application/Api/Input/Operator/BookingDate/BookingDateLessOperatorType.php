<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookingDate;

final class BookingDateLessOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '<';
    }
}
