<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\BookableStateType;
use Application\DBAL\Types\BookingTypeType;
use Application\Repository\BookableTagRepository;
use Application\Traits\HasCode;
use Application\Traits\HasDescription;
use Application\Traits\HasName;
use Application\Traits\HasRemarks;
use Cake\Chronos\Date;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;

/**
 * An item that can be booked by a user
 *
 * @ORM\Entity(repositoryClass="Application\Repository\BookableRepository")
 */
class Bookable extends AbstractModel
{
    use HasName;
    use HasDescription;
    use HasCode;
    use HasRemarks;

    /**
     * @var string
     *
     * @ORM\Column(type="decimal", precision=10, scale=2, options={"default" = "0.00"})
     */
    private $initialPrice = '0';

    /**
     * @var string
     *
     * @ORM\Column(type="decimal", precision=10, scale=2, options={"default" = "0.00"})
     */
    private $periodicPrice = '0';

    /**
     * @var string
     *
     * @ORM\Column(type="decimal", precision=10, scale=2, options={"default" = "0.00", "unsigned" = true})
     */
    private $purchasePrice = '0';

    /**
     * @var int
     *
     * @ORM\Column(type="smallint", options={"default" = "-1"})
     */
    private $simultaneousBookingMaximum = 1;

    /**
     * @var string
     *
     * @ORM\Column(type="BookingType", length=10, options={"default" = BookingTypeType::SELF_APPROVED})
     */
    private $bookingType = BookingTypeType::SELF_APPROVED;

    /**
     * @var bool
     *
     * @ORM\Column(type="boolean", options={"default" = 1})
     */
    private $isActive = true;

    /**
     * @var string
     *
     * @ORM\Column(type="BookableState", length=10, options={"default" = BookableStateType::GOOD})
     */
    private $state = BookableStateType::GOOD;

    /**
     * @var null|Date
     * @ORM\Column(type="date", nullable=true)
     */
    private $verificationDate;

    /**
     * @var BookableTag
     *
     * @ORM\ManyToMany(targetEntity="BookableTag", mappedBy="bookables")
     */
    private $bookableTags;

    /**
     * @var Collection
     * @ORM\OneToMany(targetEntity="Booking", mappedBy="bookable")
     */
    private $bookings;

    /**
     * @var Collection
     * @ORM\ManyToMany(targetEntity="License", mappedBy="bookables")
     */
    private $licenses;

    /**
     * @var null|Image
     * @ORM\OneToOne(targetEntity="Image", orphanRemoval=true)
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id")
     */
    private $image;

    /**
     * @var null|Account
     *
     * @ORM\ManyToOne(targetEntity="Account")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="CASCADE")
     * })
     */
    private $creditAccount;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->bookings = new ArrayCollection();
        $this->licenses = new ArrayCollection();
        $this->bookableTags = new ArrayCollection();
    }

    /**
     * @return Collection
     */
    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    /**
     * Notify the bookable that it has a new booking.
     * This should only be called by Booking::addBookable()
     *
     * @param Booking $booking
     */
    public function bookingAdded(Booking $booking): void
    {
        $this->bookings->add($booking);
    }

    /**
     * Notify the bookable that it a booking was removed.
     * This should only be called by Booking::removeBookable()
     *
     * @param Booking $booking
     */
    public function bookingRemoved(Booking $booking): void
    {
        $this->bookings->removeElement($booking);
    }

    /**
     * @return Collection
     */
    public function getLicenses(): Collection
    {
        return $this->licenses;
    }

    /**
     * Notify the bookable that it has a new license.
     * This should only be called by License::addBookable()
     *
     * @param License $license
     */
    public function licenseAdded(License $license): void
    {
        $this->licenses->add($license);
    }

    /**
     * Notify the bookable that it a license was removed.
     * This should only be called by License::removeBookable()
     *
     * @param License $license
     */
    public function licenseRemoved(License $license): void
    {
        $this->licenses->removeElement($license);
    }

    /**
     * @return string
     */
    public function getInitialPrice(): string
    {
        return $this->initialPrice;
    }

    /**
     * @param string $initialPrice
     */
    public function setInitialPrice(string $initialPrice): void
    {
        $this->initialPrice = $initialPrice;
    }

    /**
     * @return string
     */
    public function getPeriodicPrice(): string
    {
        return $this->periodicPrice;
    }

    /**
     * @param string $periodicPrice
     */
    public function setPeriodicPrice(string $periodicPrice): void
    {
        $this->periodicPrice = $periodicPrice;
    }

    /**
     * @return string
     */
    public function getPurchasePrice(): string
    {
        return $this->purchasePrice;
    }

    /**
     * @param string $purchasePrice
     */
    public function setPurchasePrice(string $purchasePrice): void
    {
        $this->purchasePrice = $purchasePrice;
    }

    /**
     * @return int
     */
    public function getSimultaneousBookingMaximum(): int
    {
        return $this->simultaneousBookingMaximum;
    }

    /**
     * @param int $simultaneousBookingMaximum
     */
    public function setSimultaneousBookingMaximum(int $simultaneousBookingMaximum): void
    {
        $this->simultaneousBookingMaximum = $simultaneousBookingMaximum;
    }

    /**
     * @API\Field(type="BookingType")
     *
     * @return string
     */
    public function getBookingType(): string
    {
        return $this->bookingType;
    }

    /**
     * Whether this bookable can be booked
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->isActive;
    }

    /**
     * Whether this bookable can be booked
     *
     * @param bool $isActive
     */
    public function setIsActive(bool $isActive): void
    {
        $this->isActive = $isActive;
    }

    /**
     * @API\Input(type="BookingType")
     *
     * @param string $state
     */
    public function setBookingType(string $state): void
    {
        $this->bookingType = $state;
    }

    /**
     * State of the bookable
     *
     * @API\Field(type="BookableState")
     *
     * @return string
     */
    public function getState(): string
    {
        return $this->state;
    }

    /**
     * State of the bookable
     *
     * @API\Input(type="BookableState")
     *
     * @param string $state
     */
    public function setState(string $state): void
    {
        $this->state = $state;
    }

    /**
     * The date then the bookable was last checked
     *
     * @return null|Date
     */
    public function getVerificationDate(): ?Date
    {
        return $this->verificationDate;
    }

    /**
     * The date then the bookable was last checked
     *
     * @param null|Date $verificationDate
     */
    public function setVerificationDate(?Date $verificationDate): void
    {
        $this->verificationDate = $verificationDate;
    }

    /**
     * @return Collection
     */
    public function getBookableTags(): Collection
    {
        return $this->bookableTags;
    }

    /**
     * Notify the user that it has a new bookableTag.
     * This should only be called by BookableTag::addUser()
     *
     * @param BookableTag $bookableTag
     */
    public function bookableTagAdded(BookableTag $bookableTag): void
    {
        $this->bookableTags->add($bookableTag);
    }

    /**
     * Notify the user that it a bookableTag was removed.
     * This should only be called by BookableTag::removeUser()
     *
     * @param BookableTag $bookableTag
     */
    public function bookableTagRemoved(BookableTag $bookableTag): void
    {
        $this->bookableTags->removeElement($bookableTag);
    }

    /**
     * @return null|Image
     */
    public function getImage(): ?Image
    {
        return $this->image;
    }

    /**
     * @param null|Image $image
     */
    public function setImage(?Image $image): void
    {
        // We must trigger lazy loading, otherwise Doctrine will seriously
        // mess up lifecycle callbacks and delete unrelated image on disk
        if ($this->image) {
            $this->image->getFilename();
        }

        $this->image = $image;
    }

    /**
     * The account to credit when booking this bookable
     *
     * @return null|Account
     */
    public function getCreditAccount(): ?Account
    {
        return $this->creditAccount;
    }

    /**
     * The account to credit when booking this bookable
     *
     * @param null|Account $creditAccount
     */
    public function setCreditAccount(?Account $creditAccount): void
    {
        $this->creditAccount = $creditAccount;
    }

    /**
     * Return a list of effective active bookings including sharing conditions.
     *
     * Only "admin-only" + storage tags are sharable bookables. In this case, a list of bookings is returned.
     *
     * For other bookable types, returns null
     *
     * @return null|Booking[]
     */
    public function getSharedBookings()
    {
        $isAdminOnly = $this->getBookingType() === \Application\DBAL\Types\BookingTypeType::ADMIN_ONLY;

        $isStorage = false;
        foreach ($this->getBookableTags() as $tag) {
            if ($tag->getId() === BookableTagRepository::STORAGE_ID) {
                $isStorage = true;

                break;
            }
        }

        if (!$isAdminOnly || !$isStorage) {
            return null;
        }

        $bookings = array_filter($this->getBookings()->toArray(), function (Booking $booking) {
            return !$booking->getEndDate();
        });

        return $bookings;
    }
}
