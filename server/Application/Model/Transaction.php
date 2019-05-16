<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Traits\HasInternalRemarks;
use Application\Traits\HasName;
use Application\Traits\HasRemarks;
use Cake\Chronos\Chronos;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Money\Currencies\ISOCurrencies;
use Money\Formatter\DecimalMoneyFormatter;
use Money\Money;

/**
 * An accounting journal entry (simple or compound)
 *
 * @ORM\Entity(repositoryClass="Application\Repository\TransactionRepository")
 * @ORM\HasLifecycleCallbacks
 */
class Transaction extends AbstractModel
{
    use HasName;
    use HasRemarks;
    use HasInternalRemarks;

    /**
     * @var Chronos
     * @ORM\Column(type="datetime")
     */
    private $transactionDate;

    /**
     * @var Collection
     * @ORM\OneToMany(targetEntity="TransactionLine", mappedBy="transaction")
     */
    private $transactionLines;

    /**
     * @var Collection
     * @ORM\OneToMany(targetEntity="AccountingDocument", mappedBy="transaction")
     */
    private $accountingDocuments;

    /**
     * @var ExpenseClaim
     *
     * @ORM\ManyToOne(targetEntity="ExpenseClaim", inversedBy="transactions")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     * })
     */
    private $expenseClaim;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=18, options={"default" = ""})
     */
    private $datatransRef = '';

    /**
     * @var Money
     *
     * @ORM\Column(type="Money", nullable=true, options={"unsigned" = true})
     */
    private $balance;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->transactionLines = new ArrayCollection();
        $this->accountingDocuments = new ArrayCollection();
    }

    /**
     * Set date of transaction
     *
     * @param Chronos $transactionDate
     */
    public function setTransactionDate(Chronos $transactionDate): void
    {
        $this->transactionDate = $transactionDate;
    }

    /**
     * Get date of transaction
     *
     * @return Chronos
     */
    public function getTransactionDate(): Chronos
    {
        return $this->transactionDate;
    }

    /**
     * Notify when a transaction line is added
     * This should only be called by TransactionLine::setTransaction()
     *
     * @param TransactionLine $transactionLine
     */
    public function transactionLineAdded(TransactionLine $transactionLine): void
    {
        $this->transactionLines->add($transactionLine);
    }

    /**
     * Notify when a transaction line is removed
     * This should only be called by TransactionLine::setTransaction()
     *
     * @param TransactionLine $transactionLine
     */
    public function transactionLineRemoved(TransactionLine $transactionLine): void
    {
        $this->transactionLines->removeElement($transactionLine);
    }

    /**
     * @return Collection
     */
    public function getTransactionLines(): Collection
    {
        return $this->transactionLines;
    }

    /**
     * Notify the transaction that an accounting document was added
     * This should only be called by AccountingDocument::setTransaction()
     *
     * @param AccountingDocument $document
     */
    public function accountingDocumentAdded(AccountingDocument $document): void
    {
        $this->accountingDocuments->add($document);
    }

    /**
     * Notify the transaction that an accounting document was removed
     * This should only be called by AccountingDocument::setTransaction()
     *
     * @param AccountingDocument $document
     */
    public function accountingDocumentRemoved(AccountingDocument $document): void
    {
        $this->accountingDocuments->removeElement($document);
    }

    /**
     * Get accounting documents
     *
     * @return Collection
     */
    public function getAccountingDocuments(): Collection
    {
        return $this->accountingDocuments;
    }

    /**
     * Set expense claim
     *
     * @param null|ExpenseClaim $expenseClaim
     */
    public function setExpenseClaim(?ExpenseClaim $expenseClaim): void
    {
        if ($this->expenseClaim && $expenseClaim !== $this->expenseClaim) {
            $this->expenseClaim->transactionRemoved($this);
        }

        $this->expenseClaim = $expenseClaim;
        $this->expenseClaim && $this->expenseClaim->transactionAdded($this);
    }

    /**
     * Get expense claim
     *
     * @return null|ExpenseClaim
     */
    public function getExpenseClaim(): ?ExpenseClaim
    {
        return $this->expenseClaim;
    }

    /**
     * Get Datatrans payment reference number
     *
     * @param string $datatransRef
     */
    public function setDatatransRef(string $datatransRef): void
    {
        $this->datatransRef = $datatransRef;
    }

    /**
     * Set Datatrans payment reference number
     *
     * @return string
     */
    public function getDatatransRef(): string
    {
        return $this->datatransRef;
    }

    /**
     * Automatically called by Doctrine whenever a transaction is created or updated
     *
     * @ORM\PrePersist
     * @ORM\PreUpdate
     */
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
            $currencies = new ISOCurrencies();
            $moneyFormatter = new DecimalMoneyFormatter($currencies);

            throw new \Application\Api\Exception(sprintf('Transaction %s non-équilibrée, débits: %s, crédits: %s', $this->getId() ?? 'NEW', $moneyFormatter->format($totalDebit), $moneyFormatter->format($totalCredit)));
        }
    }

    /**
     * Get total balance
     *
     * Read only, computed by SQL triggers
     *
     * @return Money
     */
    public function getBalance(): Money
    {
        return $this->balance;
    }
}
