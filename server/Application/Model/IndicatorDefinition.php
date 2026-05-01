<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Repository\IndicatorDefinitionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * Accounting indicator formula.
 */
#[ORM\Entity(IndicatorDefinitionRepository::class)]
class IndicatorDefinition extends AbstractModel
{
    use HasName;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $sorting = 0;

    /**
     * @var Collection<int, IndicatorDefinitionAddend>
     */
    #[ORM\OneToMany(targetEntity: IndicatorDefinitionAddend::class, mappedBy: 'indicatorDefinition', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $addends;

    /**
     * @var Collection<int, IndicatorDefinitionSubtrahend>
     */
    #[ORM\OneToMany(targetEntity: IndicatorDefinitionSubtrahend::class, mappedBy: 'indicatorDefinition', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $subtrahends;

    public function __construct()
    {
        $this->addends = new ArrayCollection();
        $this->subtrahends = new ArrayCollection();
    }

    public function getSorting(): int
    {
        return $this->sorting;
    }

    public function setSorting(int $sorting): void
    {
        $this->sorting = $sorting;
    }

    /**
     * @return Collection<int, IndicatorDefinitionAddend>
     */
    public function getAddends(): Collection
    {
        return $this->addends;
    }

    /**
     * @return Collection<int, IndicatorDefinitionSubtrahend>
     */
    public function getSubtrahends(): Collection
    {
        return $this->subtrahends;
    }
}
