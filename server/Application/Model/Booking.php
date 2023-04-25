<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\BookingStatusType;
use Application\Repository\BookingRepository;
use Application\Service\Invoicer;
use Application\Traits\HasRemarks;
use Cake\Chronos\Chronos;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasInternalRemarks;
use GraphQL\Doctrine\Attribute as API;
use Money\Money;

/**
 * A booking linking a user and a bookable.
 */
#[API\Sorting(\Application\Api\Input\Sorting\Bookable::class)]
#[ORM\Entity(BookingRepository::class)]
#[ORM\AssociationOverrides([new ORM\AssociationOverride(name: 'owner', inversedBy: 'bookings')])]
class Booking extends AbstractModel
{
    use HasInternalRemarks;
    use HasRemarks;

    #[ORM\Column(type: 'BookingStatus', length: 10, options: ['default' => BookingStatusType::APPLICATION])]
    private string $status = BookingStatusType::APPLICATION;

    #[ORM\Column(type: 'integer', options: ['unsigned' => true, 'default' => 1])]
    private int $participantCount = 1;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => ''])]
    private string $destination = '';

    #[ORM\Column(type: 'text', length: 65535, options: ['default' => ''])]
    private string $startComment = '';

    #[ORM\Column(type: 'text', length: 65535, options: ['default' => ''])]
    private string $endComment = '';

    #[ORM\Column(type: 'datetime')]
    private Chronos $startDate;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?Chronos $endDate = null;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => ''])]
    private string $estimatedEndDate = '';

    #[ORM\JoinColumn(onDelete: 'CASCADE')]
    #[ORM\ManyToOne(targetEntity: Bookable::class, inversedBy: 'bookings')]
    private ?Bookable $bookable = null;

    /**
     * Constructor.
     */
    public function __construct()
    {
    }

    public function setOwner(?User $owner = null): void
    {
        if ($this->getOwner()) {
            $this->getOwner()->bookingRemoved($this);
        }

        parent::setOwner($owner);

        if ($this->getOwner()) {
            $this->getOwner()->bookingAdded($this);
        }

        $this->invoiceInitial();
    }

    /**
     * Total count of participant, at least 1.
     */
    public function getParticipantCount(): int
    {
        return $this->participantCount;
    }

    public function setParticipantCount(int $participantCount): void
    {
        $this->participantCount = $participantCount;
    }

    public function getDestination(): string
    {
        return $this->destination;
    }

    public function setDestination(string $destination): void
    {
        $this->destination = $destination;
    }

    public function getStartComment(): string
    {
        return $this->startComment;
    }

    public function setStartComment(string $startComment): void
    {
        $this->startComment = $startComment;
    }

    public function getEndComment(): string
    {
        return $this->endComment;
    }

    public function setEndComment(string $endComment): void
    {
        $this->endComment = $endComment;
    }

    public function getStartDate(): Chronos
    {
        return $this->startDate;
    }

    public function setStartDate(Chronos $startDate): void
    {
        $this->startDate = $startDate;
    }

    public function getEndDate(): ?Chronos
    {
        return $this->endDate;
    }

    public function setEndDate(?Chronos $endDate): void
    {
        $this->endDate = $endDate;
    }

    public function getEstimatedEndDate(): string
    {
        return $this->estimatedEndDate;
    }

    public function setEstimatedEndDate(string $estimatedEndDate): void
    {
        $this->estimatedEndDate = $estimatedEndDate;
    }

    /**
     * Get bookable, may be null for "my own material" case.
     */
    public function getBookable(): ?Bookable
    {
        return $this->bookable;
    }

    /**
     * Set bookable.
     */
    public function setBookable(?Bookable $bookable): void
    {
        if ($this->bookable) {
            $this->bookable->bookingRemoved($this);
        }

        $this->bookable = $bookable;

        if ($this->bookable) {
            $this->bookable->bookingAdded($this);
        }

        $this->invoiceInitial();
    }

    #[API\Field(type: 'BookingStatus')]
    public function getStatus(): string
    {
        return $this->status;
    }

    #[API\Input(type: 'BookingStatus')]
    public function setStatus(string $status): void
    {
        $previousStatus = $this->status;
        $this->status = $status;
        $this->invoiceInitial($previousStatus);
    }

    /**
     * Mark the booking as terminated with an optional comment,
     * but only if not already terminated.
     */
    public function terminate(?string $comment): void
    {
        // Booking can only be terminated once
        if (!$this->getEndDate()) {
            $this->setEndDate(new Chronos());
            if ($comment) {
                $this->setEndComment($comment);
            }
        }
    }

    /**
     * If the booking is complete, will make initial invoicing.
     */
    private function invoiceInitial(?string $previousStatus = null): void
    {
        if (!$this->getOwner() || !$this->getBookable()) {
            return;
        }

        global $container;

        /** @var Invoicer $invoicer */
        $invoicer = $container->get(Invoicer::class);
        $invoicer->invoiceInitial($this->getOwner(), $this, $previousStatus);
    }

    /**
     * Returns the next invoiceable periodic price.
     *
     * In case it uses shared admin_assigned bookables, the price is divided by the number of usages
     */
    public function getPeriodicPrice(): Money
    {
        $bookable = $this->getBookable();
        $bookings = $bookable->getPeriodicPriceDividerBookings();

        if (!$bookings) {
            return $bookable->getPeriodicPrice();
        }

        return $bookable->getPeriodicPrice()->divide(count($bookings));
    }
}
