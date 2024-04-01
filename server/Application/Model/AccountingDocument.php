<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Repository\AccountingDocumentRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * A document attesting an expense claim.
 */
#[ORM\UniqueConstraint(name: 'unique_name', columns: ['filename'])]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(AccountingDocumentRepository::class)]
class AccountingDocument extends AbstractModel implements \Ecodev\Felix\Model\File
{
    use \Ecodev\Felix\Model\Traits\File;

    protected function getBasePath(): string
    {
        return 'data/accounting/';
    }

    #[ORM\JoinColumn(onDelete: 'CASCADE')]
    #[ORM\ManyToOne(targetEntity: ExpenseClaim::class, inversedBy: 'accountingDocuments')]
    private ?ExpenseClaim $expenseClaim = null;

    #[ORM\JoinColumn(onDelete: 'CASCADE')]
    #[ORM\ManyToOne(targetEntity: Transaction::class, inversedBy: 'accountingDocuments')]
    private ?Transaction $transaction = null;

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
