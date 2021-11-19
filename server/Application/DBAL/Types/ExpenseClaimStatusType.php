<?php

declare(strict_types=1);

namespace Application\DBAL\Types;

use Ecodev\Felix\DBAL\Types\EnumType;

class ExpenseClaimStatusType extends EnumType
{
    public const NEW = 'new';
    public const PROCESSING = 'processing';
    public const PROCESSED = 'processed';
    public const REJECTED = 'rejected';

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
