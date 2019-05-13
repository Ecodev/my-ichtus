<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\BookingStatusType;
use Application\Service\Invoicer;
use Application\Traits\HasInternalRemarks;
use Application\Traits\HasRemarks;
use Application\Utility;
use Cake\Chronos\Chronos;
use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;
use Money\Money;

/**
 * A booking linking a user and a bookable
 *
 * @ORM\Entity(repositoryClass="Application\Repository\BookingRepository")
 * @ORM\AssociationOverrides({
 *     @ORM\AssociationOverride(name="owner", inversedBy="bookings")
 * })
 */
class Booking extends AbstractModel
{
    use HasRemarks;
    use HasInternalRemarks;

    /**
     * @var string
     *
     * @ORM\Column(type="BookingStatus", length=10, options={"default" = BookingStatusType::APPLICATION})
     */
    private $status = BookingStatusType::APPLICATION;

    /**
     * @var int
     * @ORM\Column(type="integer", options={"unsigned" = true, "default" = 1})
     */
    private $participantCount = 1;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=50, options={"default" = ""})
     */
    private $destination = '';

    /**
     * @var string
     *
     * @ORM\Column(type="text", length=65535, options={"default" = ""})
     */
    private $startComment = '';

    /**
     * @var string
     *
     * @ORM\Column(type="text", length=65535, options={"default" = ""})
     */
    private $endComment = '';

    /**
     * @var Chronos
     *
     * @ORM\Column(type="datetime")
     */
    private $startDate;

    /**
     * @var Chronos
     *
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $endDate;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=50, options={"default" = ""})
     */
    private $estimatedEndDate = '';

    /**
     * @var null|Bookable
     *
     * @ORM\ManyToOne(targetEntity="Bookable", inversedBy="bookings")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="CASCADE")
     * })
     */
    private $bookable;

    /**
     * Constructor
     */
    public function __construct()
    {
    }

    public function setOwner(User $owner = null): void
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
     *
     * @return int
     */
    public function getParticipantCount(): int
    {
        return $this->participantCount;
    }

    /**
     * @param int $participantCount
     */
    public function setParticipantCount(int $participantCount): void
    {
        $this->participantCount = $participantCount;
    }

    /**
     * @return string
     */
    public function getDestination(): string
    {
        return $this->destination;
    }

    /**
     * @param string $destination
     */
    public function setDestination(string $destination): void
    {
        $this->destination = $destination;
    }

    /**
     * @return string
     */
    public function getStartComment(): string
    {
        return $this->startComment;
    }

    /**
     * @param string $startComment
     */
    public function setStartComment(string $startComment): void
    {
        $this->startComment = $startComment;
    }

    /**
     * @return string
     */
    public function getEndComment(): string
    {
        return $this->endComment;
    }

    /**
     * @param string $endComment
     */
    public function setEndComment(string $endComment): void
    {
        $this->endComment = $endComment;
    }

    /**
     * @return Chronos
     */
    public function getStartDate(): Chronos
    {
        return $this->startDate;
    }

    /**
     * @param Chronos $startDate
     */
    public function setStartDate(Chronos $startDate): void
    {
        $this->startDate = $startDate;
    }

    /**
     * @return null|Chronos
     */
    public function getEndDate(): ?Chronos
    {
        return $this->endDate;
    }

    /**
     * @param null|Chronos $endDate
     */
    public function setEndDate(?Chronos $endDate): void
    {
        $this->endDate = $endDate;
    }

    /**
     * @return string
     */
    public function getEstimatedEndDate(): string
    {
        return $this->estimatedEndDate;
    }

    /**
     * @param string $estimatedEndDate
     */
    public function setEstimatedEndDate(string $estimatedEndDate): void
    {
        $this->estimatedEndDate = $estimatedEndDate;
    }

    /**
     * Get bookable, may be null for "my own material" case
     *
     * @return null|Bookable
     */
    public function getBookable(): ?Bookable
    {
        return $this->bookable;
    }

    /**
     * Set bookable
     *
     * @param null|Bookable $bookable
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

    /**
     * @API\Field(type="BookingStatus")
     *
     * @return string
     */
    public function getStatus(): string
    {
        return $this->status;
    }

    /**
     * @API\Input(type="BookingStatus")
     *
     * @param string $status
     */
    public function setStatus(string $status): void
    {
        $this->status = $status;
        $this->invoiceInitial();
    }

    /**
     * Mark the booking as terminated with an optional comment,
     * but only if not already terminated
     *
     * @param null|string $comment
     */
    public function terminate(?string $comment): void
    {
        // Booking can only be terminated once
        if (!$this->getEndDate()) {
            $this->setEndDate(Utility::getNow());
            if ($comment) {
                $this->setEndComment($comment);
            }
        }
    }

    /**
     * If the booking is complete, will make initial invoicing
     */
    private function invoiceInitial(): void
    {
        if (!$this->getOwner() || !$this->getBookable()) {
            return;
        }

        global $container;

        /** @var Invoicer $invoicer */
        $invoicer = $container->get(Invoicer::class);
        $invoicer->invoiceInitial($this->getOwner(), $this);
    }

    /**
     * Returns the next invoicable periodic price
     *
     * In case it uses shared admin_only bookables, the price is divided by the number of usages
     *
     * @return Money
     */
    public function getPeriodicPrice(): Money
    {
        $bookable = $this->getBookable();
        $bookings = $bookable->getSharedBookings();

        if (!$bookings) {
            return $bookable->getPeriodicPrice();
        }

        return $bookable->getPeriodicPrice()->divide(count($bookings));
    }
}
