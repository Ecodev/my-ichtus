<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Repository\TransactionTagRepository;
use Application\Traits\HasColor;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * Analytic account.
 */
#[ORM\Entity(TransactionTagRepository::class)]
class TransactionTag extends AbstractModel
{
    use HasColor;
    use HasName;
}
