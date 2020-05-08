<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class ExpenseClaimStatusType extends EnumType
{
    const NEW = 'new';
    const PROCESSING = 'processing';
    const PROCESSED = 'processed';
    const REJECTED = 'rejected';

    protected function getPossibleValues(): array
    {
        return [
            self::NEW,
            self::PROCESSING,
            self::PROCESSED,
            self::REJECTED,
        ];
    }
}
