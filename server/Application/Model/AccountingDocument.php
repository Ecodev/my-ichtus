<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;

/**
 * A document attesting an expense claim.
 *
 * @ORM\HasLifecycleCallbacks
 * @ORM\Entity(repositoryClass="Application\Repository\AccountingDocumentRepository")
 * @ORM\Table(uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unique_name", columns={"filename"})
 * })
 */
class AccountingDocument extends AbstractModel implements \Ecodev\Felix\Model\File
{
    use \Ecodev\Felix\Model\Traits\File;

    protected function getBasePath(): string
    {
        return 'data/accounting/';
    }

    /**
     * @var null|ExpenseClaim
     *
     * @ORM\ManyToOne(targetEntity="ExpenseClaim", inversedBy="accountingDocuments")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="CASCADE")
     * })
     */
    private $expenseClaim;

    /**
     * @var null|Transaction
     *
     * @ORM\ManyToOne(targetEntity="Transaction", inversedBy="accountingDocuments")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="CASCADE")
     * })
     */
    private $transaction;

    public function setExpenseClaim(?ExpenseClaim $expenseClaim): void
    {
        if ($this->expenseClaim) {
            $this->expenseClaim->accountingDocumentRemoved($this);
        }

        $this->expenseClaim = $expenseClaim;

        if ($this->expenseClaim) {
            $expenseClaim->accountingDocumentAdded($this);
        }
    }

    public function getExpenseClaim(): ?ExpenseClaim
    {
        return $this->expenseClaim;
    }

    public function setTransaction(?Transaction $transaction): void
    {
        if ($this->transaction) {
            $this->transaction->accountingDocumentRemoved($this);
        }

        $this->transaction = $transaction;

        if ($this->transaction) {
            $transaction->accountingDocumentAdded($this);
        }
    }

    public function getTransaction(): ?Transaction
    {
        return $this->transaction;
    }
}
