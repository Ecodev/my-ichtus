<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Enum\AccountType;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionLineRepository;
use Application\Traits\HasIban;
use Cake\Chronos\ChronosDate;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Attribute as API;
use Money\Money;

/**
 * Financial account.
 */
#[ORM\Entity(AccountRepository::class)]
#[ORM\AssociationOverrides([new ORM\AssociationOverride(name: 'owner', inversedBy: 'accounts', joinColumns: new ORM\JoinColumn(unique: true, onDelete: 'SET NULL'))])]
class Account extends AbstractModel
{
    use HasIban;
    use HasName;

    #[ORM\Column(type: 'Money', options: ['default' => 0])]
    private Money $balance;

    #[ORM\JoinColumn(onDelete: 'CASCADE')]
    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'children')]
    private ?Account $parent = null;

    /**
     * @var Collection<int, Account>
     */
    #[ORM\OneToMany(targetEntity: self::class, mappedBy: 'parent')]
    #[ORM\OrderBy(['code' => 'ASC'])]
    private Collection $children;

    #[ORM\Column(type: 'enum', length: 10)]
    private AccountType $type;

    #[ORM\Column(type: 'integer', unique: true, options: ['unsigned' => true])]
    private int $code;

    /**
     * @var Collection<int, TransactionLine>
     */
    #[ORM\OneToMany(targetEntity: TransactionLine::class, mappedBy: 'debit')]
    private Collection $debitTransactionLines;

    /**
     * @var Collection<int, TransactionLine>
     */
    #[ORM\OneToMany(targetEntity: TransactionLine::class, mappedBy: 'credit')]
    private Collection $creditTransactionLines;

    #[ORM\Column(type: 'Money', options: ['default' => 0])]
    private Money $totalBalance;

    #[ORM\Column(type: 'Money', nullable: true)]
    private ?Money $budgetAllowed = null;

    #[ORM\Column(type: 'Money', nullable: true, columnDefinition: 'INT AS (IF(type = \'asset\', budget_allowed - (total_balance - total_balance_former), budget_allowed - total_balance)) PERSISTENT')]
    private ?Money $budgetBalance = null;

    #[ORM\Column(type: 'Money', options: ['default' => 0])]
    private Money $totalBalanceFormer;

    public function __construct()
    {
        $this->balance = Money::CHF(0);
        $this->totalBalance = Money::CHF(0);
        $this->totalBalanceFormer = Money::CHF(0);
        $this->children = new ArrayCollection();
        $this->debitTransactionLines = new ArrayCollection();
        $this->creditTransactionLines = new ArrayCollection();
    }

    /**
     * Get full name including code and name.
     */
    public function getFullName(): string
    {
        return implode(' - ', array_filter([$this->getCode(), $this->getName()]));
    }

    /**
     * Assign the account to an user.
     */
    public function setOwner(?User $owner): void
    {
        if ($this->getOwner()) {
            $this->getOwner()->accountRemoved();
        }

        parent::setOwner($owner);

        if ($this->getOwner()) {
            $owner->accountAdded($this);
        }
    }

    public function getBudgetAllowed(): ?Money
    {
        return $this->budgetAllowed;
    }

    public function setBudgetAllowed(?Money $budgetAllowed): void
    {
        $this->budgetAllowed = $budgetAllowed;
    }

    public function getBudgetBalance(): ?Money
    {
        return $this->budgetBalance;
    }

    public function getTotalBalanceFormer(): Money
    {
        return $this->totalBalanceFormer;
    }

    public function setTotalBalanceFormer(Money $totalBalanceFormer): void
    {
        $this->totalBalanceFormer = $totalBalanceFormer;
    }

    /**
     * Only members' liability accounts must have an owner
     * and there must be only an account per member.
     */
    protected function getOwnerForCreation(): ?User
    {
        return null;
    }

    /**
     * Set balance.
     */
    #[API\Exclude]
    public function setBalance(Money $balance): void
    {
        $this->balance = $balance;
    }

    public function getBalance(): Money
    {
        return $this->balance;
    }

    /**
     * Total balance, recursively including all child account if this account is a group.
     */
    public function getTotalBalance(): Money
    {
        return $this->totalBalance;
    }

    /**
     * Historical account's balance at a date in the past.
     */
    public function getBalanceAtDate(ChronosDate $date): Money
    {
        $today = ChronosDate::today();

        if ($date->greaterThan($today)) {
            throw new Exception('Cannot compute balance of account #' . $this->getId() . ' in the future on ' . $date->format('d.m.Y'));
        }

        if ($date->equals($today)) {
            if ($this->getType() === AccountType::Group) {
                return $this->getTotalBalance();
            }

            return $this->getBalance();
        }

        $connection = _em()->getConnection();

        if ($this->getType() === AccountType::Group) {
            // Get all child accounts that are not group account (= they have their own balance)
            $sql = 'WITH RECURSIVE child AS
              (SELECT id, parent_id, `type`, balance
               FROM account WHERE id = ?
               UNION
               SELECT account.id, account.parent_id, account.type, account.balance
               FROM account
               JOIN child ON account.parent_id = child.id)
            SELECT child.id FROM child WHERE `type` <> ?';

            $result = $connection->executeQuery($sql, [$this->getId(), AccountType::Group->value]);

            $ids = $result->fetchFirstColumn();

            $totals = [];
            $totalForChildren = Money::CHF(0);

            /** @var AccountRepository $accountRepository */
            $accountRepository = _em()->getRepository(self::class);
            foreach ($ids as $idAccount) {
                $child = $accountRepository->getOneById((int) $idAccount);
                $childBalance = $child->getBalanceAtDate($date);
                $totalForChildren = $totalForChildren->add($childBalance);
                $totals[(int) $idAccount] = $totalForChildren;
            }

            return $totalForChildren;
        }

        /** @var TransactionLineRepository $transactionLineRepository */
        $transactionLineRepository = _em()->getRepository(TransactionLine::class);

        $totalDebit = $transactionLineRepository->totalBalance($this, null, null, $date);
        $totalCredit = $transactionLineRepository->totalBalance(null, $this, null, $date);
        if (in_array($this->getType(), [
            AccountType::Liability,
            AccountType::Equity,
            AccountType::Revenue,
        ], true)) {
            $balance = $totalCredit->subtract($totalDebit);
        } elseif (in_array($this->getType(), [AccountType::Asset, AccountType::Expense], true)) {
            $balance = $totalDebit->subtract($totalCredit);
        } else {
            throw new Exception('Do not know how to compute past balance of account #' . $this->getId() . ' of type ' . $this->getType()->value);
        }

        return $balance;
    }

    /**
     * Set parent.
     */
    public function setParent(?self $parent): void
    {
        if ($this->getParent()) {
            $this->getParent()->getChildren()->removeElement($this);
        }

        $this->parent = $parent;

        if ($this->getParent()) {
            $this->getParent()->getChildren()->add($this);
        }
    }

    public function getParent(): ?self
    {
        return $this->parent;
    }

    public function getChildren(): Collection
    {
        return $this->children;
    }

    /**
     * Set type.
     */
    public function setType(AccountType $type): void
    {
        $this->type = $type;
    }

    /**
     * Get type.
     */
    public function getType(): AccountType
    {
        return $this->type;
    }

    /**
     * Set code.
     */
    public function setCode(int $code): void
    {
        $this->code = $code;
    }

    /**
     * Get code.
     */
    public function getCode(): int
    {
        return $this->code;
    }

    /**
     * Notify when a transaction line is added
     * This should only be called by TransactionLine::setDebit().
     */
    public function debitTransactionLineAdded(TransactionLine $transactionLine): void
    {
        $this->debitTransactionLines->add($transactionLine);
    }

    /**
     * Notify when a transaction line is removed
     * This should only be called by TransactionLine::setDebit().
     */
    public function debitTransactionLineRemoved(TransactionLine $transactionLine): void
    {
        $this->debitTransactionLines->removeElement($transactionLine);
    }

    public function getDebitTransactionLines(): Collection
    {
        return $this->debitTransactionLines;
    }

    /**
     * Notify when a transaction line is added
     * This should only be called by TransactionLine::setCredit().
     */
    public function creditTransactionLineAdded(TransactionLine $transactionLine): void
    {
        $this->creditTransactionLines->add($transactionLine);
    }

    /**
     * Notify when a transaction line is removed
     * This should only be called by TransactionLine::setCredit().
     */
    public function creditTransactionLineRemoved(TransactionLine $transactionLine): void
    {
        $this->creditTransactionLines->removeElement($transactionLine);
    }

    public function getCreditTransactionLines(): Collection
    {
        return $this->creditTransactionLines;
    }
}
