<?php

declare(strict_types=1);

namespace Application\Traits;

use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Api\Exception;
use Laminas\Validator\Iban;

/**
 * Trait for all objects with an IBAN (international bank account number).
 */
trait HasIban
{
    /**
     * @ORM\Column(type="string", length=34, options={"default" = ""})
     */
    private string $iban = '';

    /**
     * Set the IBAN (international bank account number).
     */
    public function setIban(string $iban): void
    {
        $iban = str_replace(' ', '', mb_strtoupper($iban));

        $validator = new Iban(['allow_non_sepa' => false]);
        if (empty($iban) || $validator->isValid($iban)) {
            $this->iban = $iban;
        } else {
            throw new Exception('Invalid IBAN number');
        }
    }

    /**
     * Get the IBAN (international bank account number).
     */
    public function getIban(): string
    {
        return $this->iban;
    }
}
