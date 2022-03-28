<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\AccountTypeType;
use Application\Repository\AccountRepository;
use Application\Repository\TransactionLineRepository;
use Application\Traits\HasIban;
use Cake\Chronos\Date;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Annotation as API;
use Money\Money;

/**
 * Financial account.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\AccountRepository")
 * @ORM\AssociationOverrides({
 *     @ORM\AssociationOverride(
 *         name="owner",
 *         inversedBy="accounts",
 *         joinColumns=@ORM\JoinColumn(unique=true, onDelete="SET NULL")
 *     )
 * })
 */
class Account extends AbstractModel
{
    use HasIban;
    use HasName;

    /**
     * @ORM\Column(type="Money", options={"default" = 0})
     */
    private Money $balance;

    /**
     * @ORM\ManyToOne(targetEntity="Account", inversedBy="children")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="CASCADE")
     * })
     */
    private ?Account $parent = null;

    /**
     * @var Collection<Account>
     * @ORM\OneToMany(targetEntity="Account", mappedBy="parent")
     * @ORM\OrderBy({"code" = "ASC"})
     */
    private Collection $children;

    /**
     * @ORM\Column(type="AccountType", length=10)
     */
    private string $type;

    /**
     * @ORM\Column(type="integer", unique=true, options={"unsigned" = true})
     */
    private int $code;

    /**
     * @var Collection<TransactionLine>
     * @ORM\OneToMany(targetEntity="TransactionLine", mappedBy="debit")
     */
    private Collection $debitTransactionLines;

    /**
     * @var Collection<TransactionLine>
     * @ORM\OneToMany(targetEntity="TransactionLine", mappedBy="credit")
     */
    private Collection $creditTransactionLines;

    /**
     * @ORM\Column(type="Money", options={"default" = 0})
     */
    private Money $totalBalance;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->balance = Money::CHF(0);
        $this->totalBalance = Money::CHF(0);
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
     *
     * @API\Exclude
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
     * Total balance, recursively including all child account if this account is a group.
     */
    public function getTotalBalance(): Money
    {
        return $this->totalBalance;
    }

    /**
     * Historical account's balance at a date in the past.
     */
    public function getBalanceAtDate(Date $date): Money
    {
        $today = Date::today();

        if ($date->greaterThan($today)) {
            throw new Exception('Cannot compute balance of account #' . $this->getId() . ' in the future on ' . $date->format('d.m.Y'));
        }

        if ($date->equals($today)) {
            if ($this->getType() === AccountTypeType::GROUP) {
                return $this->getTotalBalance();
            }

            return $this->getBalance();
        }

        $connection = _em()->getConnection();

        if ($this->getType() === AccountTypeType::GROUP) {

            // Get all child accounts that are not group account (= they have their own balance)
            $sql = 'WITH RECURSIVE child AS
              (SELECT id, parent_id, `type`, balance
               FROM account WHERE id = ?
               UNION
               SELECT account.id, account.parent_id, account.type, account.balance
               FROM account
               JOIN child ON account.parent_id = child.id)
            SELECT child.id FROM child WHERE `type` <> ?';

            $result = $connection->executeQuery($sql, [$this->getId(), AccountTypeType::GROUP]);

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
            AccountTypeType::LIABILITY,
            AccountTypeType::EQUITY,
            AccountTypeType::REVENUE,
        ], true)) {
            $balance = $totalCredit->subtract($totalDebit);
        } elseif (in_array($this->getType(), [AccountTypeType::ASSET, AccountTypeType::EXPENSE], true)) {
            $balance = $totalDebit->subtract($totalCredit);
        } else {
            throw new Exception('Do not know how to compute past balance of account #' . $this->getId() . ' of type ' . $this->getType());
        }

        return $balance;
    }

    /**
     * Set parent.
     *
     * @param null|Account $parent
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

    /**
     * @return null|Account
     */
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
     *
     * @API\Input(type="AccountType")
     */
    public function setType(string $type): void
    {
        $this->type = $type;
    }

    /**
     * Get type.
     *
     * @API\Field(type="AccountType")
     */
    public function getType(): string
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
