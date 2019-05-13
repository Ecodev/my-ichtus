<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\ExpenseClaimStatusType;
use Application\DBAL\Types\ExpenseClaimTypeType;
use Application\Traits\HasDescription;
use Application\Traits\HasInternalRemarks;
use Application\Traits\HasName;
use Application\Traits\HasRemarks;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;
use Money\Money;

/**
 * An expense claim to be refunded to an user
 *
 * @ORM\Entity(repositoryClass="Application\Repository\ExpenseClaimRepository")
 * @ORM\AssociationOverrides({
 *     @ORM\AssociationOverride(
 *         name="owner",
 *         joinColumns=@ORM\JoinColumn(nullable=false, onDelete="CASCADE")
 *     )
 * })
 */
class ExpenseClaim extends AbstractModel
{
    use HasName;
    use HasDescription;
    use HasRemarks;
    use HasInternalRemarks;

    /**
     * @var Money
     *
     * @ORM\Column(type="Money", options={"unsigned" = true})
     */
    private $amount;

    /**
     * @var Collection
     * @ORM\OneToMany(targetEntity="Transaction", mappedBy="expenseClaim")
     */
    private $transactions;

    /**
     * @var Collection
     * @ORM\OneToMany(targetEntity="AccountingDocument", mappedBy="expenseClaim")
     */
    private $accountingDocuments;

    /**
     * @var string
     *
     * @ORM\Column(type="ExpenseClaimStatus", length=10, options={"default" = ExpenseClaimStatusType::NEW})
     */
    private $status = ExpenseClaimStatusType::NEW;

    /**
     * @var string
     *
     * @ORM\Column(type="ExpenseClaimType", length=10, options={"default" = ExpenseClaimTypeType::EXPENSE_CLAIM})
     */
    private $type = ExpenseClaimTypeType::EXPENSE_CLAIM;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->transactions = new ArrayCollection();
        $this->accountingDocuments = new ArrayCollection();
    }

    /**
     * Set amount
     *
     * @param Money $amount
     */
    public function setAmount(Money $amount): void
    {
        $this->amount = $amount;
    }

    /**
     * Get amount
     *
     * @return Money
     */
    public function getAmount(): Money
    {
        return $this->amount;
    }

    /**
     * Set status
     *
     * @API\Input(type="ExpenseClaimStatus")
     *
     * @param string $status
     */
    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    /**
     * Get status
     *
     * @API\Field(type="ExpenseClaimStatus")
     *
     * @return string
     */
    public function getStatus(): string
    {
        return $this->status;
    }

    /**
     * Set type
     *
     * @API\Input(type="ExpenseClaimType")
     *
     * @param string $type
     */
    public function setType(string $type): void
    {
        $this->type = $type;
    }

    /**
     * Get type
     *
     * @API\Field(type="ExpenseClaimType")
     *
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * Notify the expense claim that a transaction was added
     * This should only be called by Transaction::setExpenseClaim()
     *
     * @param Transaction $transaction
     */
    public function transactionAdded(Transaction $transaction): void
    {
        $this->transactions->add($transaction);
    }

    /**
     * Notify the expense claim that a transaction was removed
     * This should only be called by Transaction::setExpenseClaim()
     *
     * @param Transaction $transaction
     */
    public function transactionRemoved(Transaction $transaction): void
    {
        $this->transactions->removeElement($transaction);
    }

    /**
     * Get the transactions created from this expense claim
     *
     * @return Collection
     */
    public function getTransactions(): Collection
    {
        return $this->transactions;
    }

    /**
     * Notify the expense that an accounting document was added
     * This should only be called by AccountingDocument::setExpenseClaim()
     *
     * @param AccountingDocument $document
     */
    public function accountingDocumentAdded(AccountingDocument $document): void
    {
        $this->accountingDocuments->add($document);
    }

    /**
     * Notify the expense that an accounting document was removed
     * This should only be called by AccountingDocument::setExpenseClaim()
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
}
