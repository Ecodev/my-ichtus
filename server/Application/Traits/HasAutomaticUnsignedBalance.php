<?php

declare(strict_types=1);

namespace Application\Traits;

use Money\Money;

trait HasAutomaticUnsignedBalance
{
    /**
     * @ORM\Column(type="Money", options={"default" = 0, "unsigned" = true})
     */
    private Money $balance;

    /**
     * Get total balance.
     *
     * Read only, computed by SQL triggers
     */
    public function getBalance(): Money
    {
        return $this->balance;
    }
}
