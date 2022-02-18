<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasDescription;

/**
 * Configuration.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\ConfigurationRepository")
 */
class Configuration extends AbstractModel
{
    use HasDescription;

    /**
     * @ORM\Column(type="text")
     */
    private string $value = '';

    public function __construct(
        /**
         * @ORM\Column(name="`key`", type="string", length=191, unique=true)
         */
        private string $key = ''
    ) {
    }

    /**
     * Get key.
     */
    public function getKey(): string
    {
        return $this->key;
    }

    /**
     * Set value.
     */
    public function setValue(string $value): void
    {
        $this->value = $value;
    }

    /**
     * Get value.
     */
    public function getValue(): string
    {
        return $this->value;
    }
}
