<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Traits\HasRemarks;
use Cake\Chronos\Chronos;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Annotation as API;
use Money\Money;

/**
 * A single line of accounting transaction.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\TransactionLineRepository")
 * @ORM\Table(uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unique_import", columns={"transaction_date", "imported_id"})
 * })
 * @API\Filters({
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\TransactionWithDocumentOperatorType", type="boolean"),
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\TransactionExportOperatorType", type="boolean"),
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\CreditOrDebitAccountOperatorType", type="id"),
 * })
 */
class TransactionLine extends AbstractModel
{
    use HasName;
    use HasRemarks;

    /**
     * @ORM\ManyToOne(targetEntity="Transaction", inversedBy="transactionLines")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=false, onDelete="RESTRICT")
     * })
     */
    private ?Transaction $transaction = null;

    /**
     * @ORM\ManyToOne(targetEntity="Account", inversedBy="debitTransactionLines")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="RESTRICT")
     * })
     */
    private ?Account $debit = null;

    /**
     * @ORM\ManyToOne(targetEntity="Account", inversedBy="creditTransactionLines")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="RESTRICT")
     * })
     */
    private ?Account $credit = null;

    /**
     * @ORM\ManyToOne(targetEntity="Bookable")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     * })
     */
    private ?Bookable $bookable = null;

    /**
     * @ORM\Column(type="Money", options={"unsigned" = true})
     */
    private Money $balance;

    /**
     * @ORM\Column(type="datetime")
     */
    private Chronos $transactionDate;

    /**
     * @ORM\ManyToOne(targetEntity="TransactionTag")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     * })
     */
    private ?TransactionTag $transactionTag = null;

    /**
     * @ORM\Column(type="boolean", options={"default" = 0})
     */
    private bool $isReconciled = false;

    /**
     * This store the value of CAMT 054 `<EndToEndId>`, or else `<AcctSvcrRef>`, element that should
     * hopefully be a universally unique transaction identifier.
     *
     * An absence of value means the line was not imported.
     *
     * @ORM\Column(type="string", length=35, nullable=true)
     */
    private ?string $importedId = null;

    /**
     * Set importedId.
     *
     * @API\Exclude
     */
    public function setImportedId(string $importedId): void
    {
        $this->importedId = $importedId;
    }

    /**
     * Get importedId.
     */
    public function getImportedId(): ?string
    {
        return $this->importedId;
    }

    /**
     * @API\Exclude
     */
    public function setTransaction(Transaction $transaction): void
    {
        if ($this->transaction) {
            $this->transaction->transactionLineRemoved($this);
        }

        $this->transaction = $transaction;
        $transaction->transactionLineAdded($this);
    }

    public function getTransaction(): Transaction
    {
        return $this->transaction;
    }

    /**
     * Set debit account.
     */
    public function setDebit(?Account $account): void
    {
        if ($this->debit) {
            $this->debit->debitTransactionLineRemoved($this);
        }

        $this->debit = $account;

        if ($this->debit) {
            $this->debit->debitTransactionLineAdded($this);
        }
    }

    /**
     * Get debit account.
     */
    public function getDebit(): ?Account
    {
        return $this->debit;
    }

    /**
     * Set credit account.
     */
    public function setCredit(?Account $account): void
    {
        if ($this->credit) {
            $this->credit->creditTransactionLineRemoved($this);
        }

        $this->credit = $account;

        if ($this->credit) {
            $this->credit->creditTransactionLineAdded($this);
        }
    }

    /**
     * Get credit account.
     */
    public function getCredit(): ?Account
    {
        return $this->credit;
    }

    /**
     * Get related equipment or service.
     */
    public function getBookable(): ?Bookable
    {
        return $this->bookable;
    }

    /**
     * Set related equipment or service.
     */
    public function setBookable(?Bookable $bookable): void
    {
        $this->bookable = $bookable;
    }

    /**
     * Set balance.
     */
    public function setBalance(Money $balance): void
    {
        $this->balance = $balance;
    }

    public function getBalance(): Money
    {
        return $this->balance;
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
     * Set transaction tag.
     */
    public function setTransactionTag(?TransactionTag $transactionTag): void
    {
        $this->transactionTag = $transactionTag;
    }

    /**
     * Get transaction tag.
     */
    public function getTransactionTag(): ?TransactionTag
    {
        return $this->transactionTag;
    }

    /**
     * Whether this line of transaction was reconciled (e.g. from a bank statement).
     */
    public function isReconciled(): bool
    {
        return $this->isReconciled;
    }

    /**
     * Whether this line of transaction was reconciled (e.g. from a bank statement).
     */
    public function setIsReconciled(bool $isReconciled): void
    {
        $this->isReconciled = $isReconciled;
    }
}
