<?php

declare(strict_types=1);

namespace Application\Traits;

use Application\Model\Country;
use Doctrine\ORM\Mapping as ORM;

/**
 * Common fields to represent an address.
 */
trait HasAddress
{
    #[ORM\Column(type: 'string', options: ['default' => ''])]
    private string $street = '';

    #[ORM\Column(type: 'string', length: 20, options: ['default' => ''])]
    private string $postcode = '';

    #[ORM\Column(type: 'string', length: 255, options: ['default' => ''])]
    private string $locality = '';

    #[ORM\ManyToOne(targetEntity: Country::class)]
    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    private ?Country $country = null;

    public function getStreet(): string
    {
        return $this->street;
    }

    public function setStreet(string $street): void
    {
        $this->street = $street;
    }

    public function getPostcode(): string
    {
        return $this->postcode;
    }

    public function setPostcode(string $postcode): void
    {
        $this->postcode = $postcode;
    }

    public function getLocality(): string
    {
        return $this->locality;
    }

    public function setLocality(string $locality): void
    {
        $this->locality = $locality;
    }

    public function getCountry(): ?Country
    {
        return $this->country;
    }

    public function setCountry(?Country $country = null): void
    {
        $this->country = $country;
    }
}
