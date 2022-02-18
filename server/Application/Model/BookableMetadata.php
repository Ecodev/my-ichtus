<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * An item that can be booked by a user.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\BookableMetadataRepository")
 * @ORM\Table(uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unique_name", columns={"name", "bookable_id"})
 * })
 */
class BookableMetadata extends AbstractModel
{
    use HasName;

    /**
     * @ORM\Column(type="string", length=191, options={"default" = ""})
     */
    private string $value = '';

    /**
     * @ORM\ManyToOne(targetEntity="Bookable")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="CASCADE", nullable=false)
     * })
     */
    private \Application\Model\Bookable $bookable;

    public function getValue(): string
    {
        return $this->value;
    }

    public function setValue(string $value): void
    {
        $this->value = $value;
    }

    public function getBookable(): Bookable
    {
        return $this->bookable;
    }

    public function setBookable(Bookable $bookable): void
    {
        $this->bookable = $bookable;
    }
}
