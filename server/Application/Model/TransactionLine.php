<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Api\Input\Operator\CreditOrDebitAccountOperatorType;
use Application\Api\Input\Operator\TransactionExportOperatorType;
use Application\Api\Input\Operator\TransactionWithDocumentOperatorType;
use Application\Repository\TransactionLineRepository;
use Application\Traits\HasRemarks;
use Cake\Chronos\Chronos;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Attribute as API;
use Money\Money;

/**
 * A single line of accounting transaction.
 */
#[ORM\UniqueConstraint(name: 'unique_import', columns: ['transaction_date', 'imported_id'])]
#[API\Filter(field: 'custom', operator: TransactionWithDocumentOperatorType::class, type: 'boolean')]
#[API\Filter(field: 'custom', operator: TransactionExportOperatorType::class, type: 'boolean')]
#[API\Filter(field: 'custom', operator: CreditOrDebitAccountOperatorType::class, type: 'id')]
#[ORM\Entity(TransactionLineRepository::class)]
class TransactionLine extends AbstractModel
{
    use HasName;
    use HasRemarks;

    #[ORM\JoinColumn(nullable: false, onDelete: 'RESTRICT')]
    #[ORM\ManyToOne(targetEntity: Transaction::class, inversedBy: 'transactionLines')]
    private ?Transaction $transaction = null;

    #[ORM\JoinColumn(onDelete: 'RESTRICT')]
    #[ORM\ManyToOne(targetEntity: Account::class, inversedBy: 'debitTransactionLines')]
    private ?Account $debit = null;

    #[ORM\JoinColumn(onDelete: 'RESTRICT')]
    #[ORM\ManyToOne(targetEntity: Account::class, inversedBy: 'creditTransactionLines')]
    private ?Account $credit = null;

    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    #[ORM\ManyToOne(targetEntity: Bookable::class)]
    private ?Bookable $bookable = null;

    #[ORM\Column(type: 'Money', options: ['unsigned' => true])]
    private Money $balance;

    #[ORM\Column(type: 'datetime')]
    private Chronos $transactionDate;

    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    #[ORM\ManyToOne(targetEntity: TransactionTag::class)]
    private ?TransactionTag $transactionTag = null;

    #[ORM\Column(type: 'boolean', options: ['default' => 0])]
    private bool $isReconciled = false;

    /**
     * This store the value of CAMT 054 `<UETR>`, or else `<EndToEndId>`, or else `<AcctSvcrRef>`, or else `<MsgId>`,
     * element that should hopefully be a universally unique transaction identifier.
     *
     * An absence of value means the line was not imported.
     */
    #[ORM\Column(type: 'string', length: 36, nullable: true)]
    private ?string $importedId = null;

    /**
     * Set importedId.
     */
    #[API\Exclude]
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

    #[API\Exclude]
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
