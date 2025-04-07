<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Repository\BookableTagRepository;
use Application\Traits\HasColor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * A type of bookable.
 *
 * Typical values would be: "Voilier", "SUP".
 */
#[ORM\UniqueConstraint(name: 'unique_name', columns: ['name'])]
#[ORM\Entity(BookableTagRepository::class)]
class BookableTag extends AbstractModel
{
    use HasColor;
    use HasName;

    /**
     * @var Collection<int, Bookable>
     */
    #[ORM\ManyToMany(targetEntity: Bookable::class, inversedBy: 'bookableTags')]
    private Collection $bookables;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->bookables = new ArrayCollection();
    }

    public function getBookables(): Collection
    {
        return $this->bookables;
    }

    /**
     * Add bookable.
     */
    public function addBookable(Bookable $bookable): void
    {
        if (!$this->bookables->contains($bookable)) {
            $this->bookables->add($bookable);
            $bookable->bookableTagAdded($this);
        }
    }

    /**
     * Remove bookable.
     */
    public function removeBookable(Bookable $bookable): void
    {
        $this->bookables->removeElement($bookable);
        $bookable->bookableTagRemoved($this);
    }
}
