<?php

declare(strict_types=1);

namespace Application\Enum;

use Ecodev\Felix\Api\Enum\LocalizedPhpEnumType;

enum ExpenseClaimStatus: string implements LocalizedPhpEnumType
{
    case New = 'new';
    case Processing = 'processing';
    case Processed = 'processed';
    case Rejected = 'rejected';

    public function getDescription(): string
    {
        return match ($this) {
            self::New => 'À traiter',
            self::Processing => 'En traitement',
            self::Processed => 'Traîté',
            self::Rejected => 'Refusé',
        };
    }
}
