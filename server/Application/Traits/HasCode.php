<?php

declare(strict_types=1);

namespace Application\Traits;

trait HasCode
{
    /**
     * @var null|string
     *
     * @ORM\Column(type="string", length=10, nullable=true, unique=true)
     */
    private $code;

    /**
     * Set code
     */
    public function setCode(?string $code): void
    {
        if (is_string($code) && trim($code) === '') {
            $code = null;
        }

        $this->code = $code;
    }

    /**
     * Get code
     */
    public function getCode(): ?string
    {
        return $this->code;
    }
}
