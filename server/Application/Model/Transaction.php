<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\ExpenseClaimStatusType;
use Application\Repository\TransactionRepository;
use Application\Traits\HasAutomaticUnsignedBalance;
use Application\Traits\HasRemarks;
use Cake\Chronos\Chronos;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Format;
use Ecodev\Felix\Model\Traits\HasInternalRemarks;
use Ecodev\Felix\Model\Traits\HasName;
use Money\Money;

/**
 * An accounting journal entry (simple or compound).
 */
#[ORM\Entity(TransactionRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Transaction extends AbstractModel
{
    use HasAutomaticUnsignedBalance;
    use HasInternalRemarks;
    use HasName;
    use HasRemarks;

    #[ORM\Column(type: 'datetime')]
    private Chronos $transactionDate;

    /**
     * @var Collection<TransactionLine>
     */
    #[ORM\OneToMany(targetEntity: TransactionLine::class, mappedBy: 'transaction')]
    private Collection $transactionLines;

    /**
     * @var Collection<AccountingDocument>
     */
    #[ORM\OneToMany(targetEntity: AccountingDocument::class, mappedBy: 'transaction')]
    private Collection $accountingDocuments;

    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    #[ORM\ManyToOne(targetEntity: ExpenseClaim::class, inversedBy: 'transactions')]
    private ?ExpenseClaim $expenseClaim = null;

    #[ORM\Column(type: 'string', length: 18, options: ['default' => ''])]
    private string $datatransRef = '';

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->balance = Money::CHF(0);
        $this->transactionLines = new ArrayCollection();
        $this->accountingDocuments = new ArrayCollection();
    }

    /**
     * Set date of transaction.
     */
    public function setTransactionDate(Chronos $transactionDate): void
    {
        $this->transactionDate = $transactionDate;
    }

    /**
     * Get date of transaction.
     */
    public function getTransactionDate(): Chronos
    {
        return $this->transactionDate;
    }

    /**
     * Notify when a transaction line is added
     * This should only be called by TransactionLine::setTransaction().
     */
    public function transactionLineAdded(TransactionLine $transactionLine): void
    {
        $this->transactionLines->add($transactionLine);
    }

    /**
     * Notify when a transaction line is removed
     * This should only be called by TransactionLine::setTransaction().
     */
    public function transactionLineRemoved(TransactionLine $transactionLine): void
    {
        $this->transactionLines->removeElement($transactionLine);
    }

    public function getTransactionLines(): Collection
    {
        return $this->transactionLines;
    }

    /**
     * Notify the transaction that an accounting document was added
     * This should only be called by AccountingDocument::setTransaction().
     */
    public function accountingDocumentAdded(AccountingDocument $document): void
    {
        $this->accountingDocuments->add($document);
    }

    /**
     * Notify the transaction that an accounting document was removed
     * This should only be called by AccountingDocument::setTransaction().
     */
    public function accountingDocumentRemoved(AccountingDocument $document): void
    {
        $this->accountingDocuments->removeElement($document);
    }

    /**
     * Get accounting documents.
     */
    public function getAccountingDocuments(): Collection
    {
        return $this->accountingDocuments;
    }

    /**
     * Set expense claim.
     */
    public function setExpenseClaim(?ExpenseClaim $expenseClaim): void
    {
        if ($this->expenseClaim) {
            $this->expenseClaim->transactionRemoved($this);
        }

        $this->expenseClaim = $expenseClaim;

        if ($this->expenseClaim) {
            $this->expenseClaim->transactionAdded($this);
            $this->expenseClaim->setStatus(ExpenseClaimStatusType::PROCESSED);
        }
    }

    /**
     * Get expense claim.
     */
    public function getExpenseClaim(): ?ExpenseClaim
    {
        return $this->expenseClaim;
    }

    /**
     * Get Datatrans payment reference number.
     */
    public function setDatatransRef(string $datatransRef): void
    {
        $this->datatransRef = $datatransRef;
    }

    /**
     * Set Datatrans payment reference number.
     */
    public function getDatatransRef(): string
    {
        return $this->datatransRef;
    }

    /**
     * Automatically called by Doctrine whenever a transaction is created or updated.
     */
    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function checkBalance(): void
    {
        $totalDebit = Money::CHF(0);
        $totalCredit = Money::CHF(0);
        foreach ($this->getTransactionLines() as $i => $line) {
            if ($line->getDebit()) {
                $totalDebit = $totalDebit->add($line->getBalance());
            }
            if ($line->getCredit()) {
                $totalCredit = $totalCredit->add($line->getBalance());
            }
        }

        if (!$totalDebit->equals($totalCredit)) {
            throw new Exception(sprintf('Transaction %s non-équilibrée, débits: %s, crédits: %s', $this->getId() ?? 'NEW', Format::money($totalDebit), Format::money($totalCredit)));
        }
    }
}
