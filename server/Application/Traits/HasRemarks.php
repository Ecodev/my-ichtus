<?php

declare(strict_types=1);

namespace Application\Traits;

use Doctrine\ORM\Mapping as ORM;

trait HasRemarks
{
    #[ORM\Column(type: 'text', length: 65535, options: ['default' => ''])]
    private string $remarks = '';

    /**
     * Set remarks.
     */
    public function setRemarks(string $remarks): void
    {
        $this->remarks = $remarks;
    }

    /**
     * Get remarks.
     */
    public function getRemarks(): string
    {
        return $this->remarks;
    }
}
