<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Traits\HasColor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * A type of bookable.
 *
 * Typical values would be: "Voilier", "SUP".
 *
 * @ORM\Entity(repositoryClass="Application\Repository\BookableTagRepository")
 * @ORM\Table(uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unique_name", columns={"name"})
 * })
 */
class BookableTag extends AbstractModel
{
    use HasName;
    use HasColor;

    /**
     * @var Collection
     * @ORM\ManyToMany(targetEntity="Bookable", inversedBy="bookableTags")
     */
    private $bookables;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->bookables = new ArrayCollection();
    }

    /**
     * @return Collection
     */
    public function getBookables(): Collection
    {
        return $this->bookables;
    }

    /**
     * Add bookable
     *
     * @param Bookable $bookable
     */
    public function addBookable(Bookable $bookable): void
    {
        if (!$this->bookables->contains($bookable)) {
            $this->bookables->add($bookable);
            $bookable->bookableTagAdded($this);
        }
    }

    /**
     * Remove bookable
     *
     * @param Bookable $bookable
     */
    public function removeBookable(Bookable $bookable): void
    {
        $this->bookables->removeElement($bookable);
        $bookable->bookableTagRemoved($this);
    }
}
