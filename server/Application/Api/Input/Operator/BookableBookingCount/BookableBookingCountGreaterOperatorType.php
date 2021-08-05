<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookableBookingCount;

final class BookableBookingCountGreaterOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '>';
    }
}
