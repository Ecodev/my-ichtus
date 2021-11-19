<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookableBookingCount;

final class BookableBookingCountLessOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '<';
    }
}
