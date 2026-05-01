<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\ORM\Mapping as ORM;

/**
 * Subtrahend account used in an accounting indicator formula.
 */
#[ORM\Entity]
class IndicatorDefinitionSubtrahend extends AbstractModel
{
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[ORM\ManyToOne(targetEntity: IndicatorDefinition::class, inversedBy: 'subtrahends')]
    private IndicatorDefinition $indicatorDefinition;

    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[ORM\ManyToOne(targetEntity: Account::class)]
    private Account $account;

    #[ORM\Column(type: 'integer', options: ['default' => 100])]
    private int $multiplier = 100;

    public function getIndicatorDefinition(): IndicatorDefinition
    {
        return $this->indicatorDefinition;
    }

    public function setIndicatorDefinition(IndicatorDefinition $indicatorDefinition): void
    {
        $this->indicatorDefinition = $indicatorDefinition;
    }

    public function getAccount(): Account
    {
        return $this->account;
    }

    public function setAccount(Account $account): void
    {
        $this->account = $account;
    }

    public function getMultiplier(): int
    {
        return $this->multiplier;
    }

    public function setMultiplier(int $multiplier): void
    {
        $this->multiplier = $multiplier;
    }
}
