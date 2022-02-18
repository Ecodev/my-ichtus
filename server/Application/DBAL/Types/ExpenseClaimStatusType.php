<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class ExpenseClaimStatusType extends EnumType
{
    final public const NEW = 'new';
    final public const PROCESSING = 'processing';
    final public const PROCESSED = 'processed';
    final public const REJECTED = 'rejected';

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
