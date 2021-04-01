<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator\BookingCount;

final class BookingCountGreaterOperatorType extends AbstractOperatorType
{
    protected function getDqlOperator(): string
    {
        return '>';
    }
}
