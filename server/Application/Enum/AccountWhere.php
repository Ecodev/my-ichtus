<?php

declare(strict_types=1);

namespace Application\Enum;

enum AccountWhere: string
{
    case DebitOrCredit = 'debitOrCredit';
    case Debit = 'debit';
    case Credit = 'credit';
}
