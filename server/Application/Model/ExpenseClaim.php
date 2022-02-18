<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\ExpenseClaimStatusType;
use Application\DBAL\Types\ExpenseClaimTypeType;
use Application\Traits\HasRemarks;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasDescription;
use Ecodev\Felix\Model\Traits\HasInternalRemarks;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Annotation as API;
use Money\Money;

/**
 * An expense claim to be refunded to a member or invoice to be paid by the company.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\ExpenseClaimRepository")
 * @ORM\AssociationOverrides({
 *     @ORM\AssociationOverride(
 *         name="owner",
 *         joinColumns=@ORM\JoinColumn(nullable=false, onDelete="CASCADE")
 *     )
 * })
 * @API\Filters({
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\ExpenseClaimToReviewOperatorType", type="boolean"),
 * })
 */
class ExpenseClaim extends AbstractModel
{
    use HasDescription;
    use HasInternalRemarks;
    use HasName;
    use HasRemarks;

    /**
     * @ORM\Column(type="Money", options={"unsigned" = true})
     */
    private \Money\Money $amount;

    /**
     * @var Collection<Transaction>
     * @ORM\OneToMany(targetEntity="Transaction", mappedBy="expenseClaim")
     */
    private Collection $transactions;

    /**
     * @var Collection<AccountingDocument>
     * @ORM\OneToMany(targetEntity="AccountingDocument", mappedBy="expenseClaim")
     */
    private Collection $accountingDocuments;

    /**
     * @ORM\Column(type="ExpenseClaimStatus", length=10, options={"default" = ExpenseClaimStatusType::NEW})
     */
    private string $status = ExpenseClaimStatusType::NEW;

    /**
     * @ORM\Column(type="ExpenseClaimType", length=10, options={"default" = ExpenseClaimTypeType::EXPENSE_CLAIM})
     */
    private string $type = ExpenseClaimTypeType::EXPENSE_CLAIM;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="SET NULL")
     * })
     */
    private ?\Application\Model\User $reviewer = null;

    /**
     * @ORM\Column(type="string", length=191, options={"default" = ""})
     */
    private string $sector = '';

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->transactions = new ArrayCollection();
        $this->accountingDocuments = new ArrayCollection();
    }

    /**
     * Set amount.
     */
    public function setAmount(Money $amount): void
    {
        $this->amount = $amount;
    }

    /**
     * Get amount.
     */
    public function getAmount(): Money
    {
        return $this->amount;
    }

    /**
     * Set status.
     *
     * @API\Input(type="ExpenseClaimStatus")
     */
    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    /**
     * Get status.
     *
     * @API\Field(type="ExpenseClaimStatus")
     */
    public function getStatus(): string
    {
        return $this->status;
    }

    /**
     * Set type.
     *
     * @API\Input(type="ExpenseClaimType")
     */
    public function setType(string $type): void
    {
        $this->type = $type;
    }

    /**
     * Get type.
     *
     * @API\Field(type="ExpenseClaimType")
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * Notify the expense claim that a transaction was added
     * This should only be called by Transaction::setExpenseClaim().
     */
    public function transactionAdded(Transaction $transaction): void
    {
        $this->transactions->add($transaction);
        $this->status = ExpenseClaimStatusType::PROCESSED;
    }

    /**
     * Notify the expense claim that a transaction was removed
     * This should only be called by Transaction::setExpenseClaim().
     */
    public function transactionRemoved(Transaction $transaction): void
    {
        $this->transactions->removeElement($transaction);
    }

    /**
     * Get the transactions created from this expense claim.
     */
    public function getTransactions(): Collection
    {
        return $this->transactions;
    }

    /**
     * Notify the expense that an accounting document was added
     * This should only be called by AccountingDocument::setExpenseClaim().
     */
    public function accountingDocumentAdded(AccountingDocument $document): void
    {
        $this->accountingDocuments->add($document);
    }

    /**
     * Notify the expense that an accounting document was removed
     * This should only be called by AccountingDocument::setExpenseClaim().
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
     * Set reviewer.
     */
    public function setReviewer(?User $reviewer): void
    {
        $this->reviewer = $reviewer;
    }

    /**
     * Get reviewer.
     */
    public function getReviewer(): ?User
    {
        return $this->reviewer;
    }

    /**
     * Set sector.
     */
    public function setSector(string $sector): void
    {
        $this->sector = $sector;
    }

    /**
     * Get sector.
     */
    public function getSector(): string
    {
        return (string) $this->sector;
    }
}
