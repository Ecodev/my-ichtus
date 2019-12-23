<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\ORM\Mapping as ORM;

/**
 * A document attesting an expense claim
 *
 * @ORM\HasLifecycleCallbacks
 * @ORM\Entity(repositoryClass="Application\Repository\AccountingDocumentRepository")
 */
class AccountingDocument extends AbstractFile
{
    protected function getBasePath(): string
    {
        return 'data/accounting/';
    }

    protected function getAcceptedMimeTypes(): array
    {
        return [
            'image/bmp',
            'image/gif',
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/svg+xml',
            'image/webp',
            'application/pdf',
            'application/x-pdf',
        ];
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

    /**
     * @param null|ExpenseClaim $expenseClaim
     */
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

    /**
     * @return null|ExpenseClaim
     */
    public function getExpenseClaim(): ?ExpenseClaim
    {
        return $this->expenseClaim;
    }

    /**
     * @param null|Transaction $transaction
     */
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

    /**
     * @return null|Transaction
     */
    public function getTransaction(): ?Transaction
    {
        return $this->transaction;
    }
}
