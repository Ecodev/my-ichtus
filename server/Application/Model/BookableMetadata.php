<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Repository\BookableMetadataRepository;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * An item that can be booked by a user.
 */
#[ORM\UniqueConstraint(name: 'unique_name', columns: ['name', 'bookable_id'])]
#[ORM\Entity(BookableMetadataRepository::class)]
class BookableMetadata extends AbstractModel
{
    use HasName;

    #[ORM\Column(type: 'string', length: 191, options: ['default' => ''])]
    private string $value = '';

    #[ORM\JoinColumn(onDelete: 'CASCADE', nullable: false)]
    #[ORM\ManyToOne(targetEntity: Bookable::class)]
    private ?Bookable $bookable = null;

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
