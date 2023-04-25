<?php

declare(strict_types=1);

namespace Application\Traits;

use Doctrine\ORM\Mapping as ORM;

trait HasCode
{
    #[ORM\Column(type: 'string', length: 10, nullable: true, unique: true)]
    private ?string $code = null;

    /**
     * Set code.
     */
    public function setCode(?string $code): void
    {
        if (is_string($code) && trim($code) === '') {
            $code = null;
        }

        $this->code = $code;
    }

    /**
     * Get code.
     */
    public function getCode(): ?string
    {
        return $this->code;
    }
}
