<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Api\Input\Operator\ExpenseClaimToReviewOperatorType;
use Application\Enum\ExpenseClaimStatus;
use Application\Enum\ExpenseClaimType;
use Application\Repository\ExpenseClaimRepository;
use Application\Traits\HasRemarks;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasDescription;
use Ecodev\Felix\Model\Traits\HasInternalRemarks;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Attribute as API;
use Money\Money;

/**
 * An expense claim to be refunded to a member or invoice to be paid by the company.
 */
#[API\Filter(field: 'custom', operator: ExpenseClaimToReviewOperatorType::class, type: 'boolean')]
#[ORM\Entity(ExpenseClaimRepository::class)]
#[ORM\AssociationOverrides([new ORM\AssociationOverride(name: 'owner', joinColumns: new ORM\JoinColumn(nullable: false, onDelete: 'CASCADE'))])]
class ExpenseClaim extends AbstractModel
{
    use HasDescription;
    use HasInternalRemarks;
    use HasName;
    use HasRemarks;

    #[ORM\Column(type: 'Money', options: ['unsigned' => true])]
    private Money $amount;

    /**
     * @var Collection<int, Transaction>
     */
    #[ORM\OneToMany(targetEntity: Transaction::class, mappedBy: 'expenseClaim')]
    private Collection $transactions;

    /**
     * @var Collection<int, AccountingDocument>
     */
    #[ORM\OneToMany(targetEntity: AccountingDocument::class, mappedBy: 'expenseClaim')]
    private Collection $accountingDocuments;

    #[ORM\Column(type: 'ExpenseClaimStatus', length: 10, options: ['default' => ExpenseClaimStatus::New])]
    private ExpenseClaimStatus $status = ExpenseClaimStatus::New;

    #[ORM\Column(type: 'ExpenseClaimType', length: 10, options: ['default' => ExpenseClaimType::ExpenseClaim])]
    private ExpenseClaimType $type = ExpenseClaimType::ExpenseClaim;

    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $reviewer = null;

    #[ORM\Column(type: 'string', length: 191, options: ['default' => ''])]
    private string $sector = '';

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
     */
    public function setStatus(ExpenseClaimStatus $status): void
    {
        $this->status = $status;
    }

    /**
     * Get status.
     */
    public function getStatus(): ExpenseClaimStatus
    {
        return $this->status;
    }

    /**
     * Set type.
     */
    public function setType(ExpenseClaimType $type): void
    {
        $this->type = $type;
    }

    /**
     * Get type.
     */
    public function getType(): ExpenseClaimType
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
        $this->status = ExpenseClaimStatus::Processed;
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
