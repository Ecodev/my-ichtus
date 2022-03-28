<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\BookableStateType;
use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\BookingTypeType;
use Application\Repository\BookableTagRepository;
use Application\Traits\HasCode;
use Application\Traits\HasRemarks;
use Cake\Chronos\Date;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasDescription;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Annotation as API;
use Money\Money;

/**
 * An item that can be booked by a user.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\BookableRepository")
 * @API\Filters({
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\BookableUsageOperatorType", type="id"),
 *     @API\Filter(field="bookableBookingCount", operator="Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountEqualOperatorType", type="int"),
 *     @API\Filter(field="bookableBookingCount", operator="Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountGreaterOperatorType", type="int"),
 *     @API\Filter(field="bookableBookingCount", operator="Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountGreaterOrEqualOperatorType", type="int"),
 *     @API\Filter(field="bookableBookingCount", operator="Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountLessOperatorType", type="int"),
 *     @API\Filter(field="bookableBookingCount", operator="Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountLessOrEqualOperatorType", type="int"),
 * })
 */
class Bookable extends AbstractModel
{
    use HasCode;
    use HasDescription;
    use HasName;
    use HasRemarks;

    /**
     * @ORM\Column(type="Money", options={"default" = 0})
     */
    private Money $initialPrice;

    /**
     * @ORM\Column(type="Money", options={"default" = 0})
     */
    private Money $periodicPrice;

    /**
     * @ORM\Column(type="Money", nullable=true, options={"unsigned" = true})
     */
    private ?Money $purchasePrice = null;

    /**
     * @ORM\Column(type="smallint", options={"default" = "-1"})
     */
    private int $simultaneousBookingMaximum = 1;

    /**
     * @ORM\Column(type="BookingType", length=10, options={"default" = BookingTypeType::SELF_APPROVED})
     */
    private string $bookingType = BookingTypeType::SELF_APPROVED;

    /**
     * @ORM\Column(type="boolean", options={"default" = 1})
     */
    private bool $isActive = true;

    /**
     * @ORM\Column(type="BookableState", length=10, options={"default" = BookableStateType::GOOD})
     */
    private string $state = BookableStateType::GOOD;

    /**
     * @ORM\Column(type="date", nullable=true)
     */
    private ?Date $verificationDate = null;

    /**
     * @var Collection<BookableTag>
     *
     * @ORM\ManyToMany(targetEntity="BookableTag", mappedBy="bookables")
     */
    private Collection $bookableTags;

    /**
     * @var Collection<Booking>
     * @ORM\OneToMany(targetEntity="Booking", mappedBy="bookable")
     */
    private Collection $bookings;

    /**
     * @var Collection<License>
     * @ORM\ManyToMany(targetEntity="License", mappedBy="bookables")
     */
    private Collection $licenses;

    /**
     * @ORM\OneToOne(targetEntity="Image", orphanRemoval=true)
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id")
     */
    private ?Image $image = null;

    /**
     * @ORM\ManyToOne(targetEntity="Account")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="CASCADE")
     * })
     */
    private ?Account $creditAccount = null;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->initialPrice = Money::CHF(0);
        $this->periodicPrice = Money::CHF(0);

        $this->bookings = new ArrayCollection();
        $this->licenses = new ArrayCollection();
        $this->bookableTags = new ArrayCollection();
    }

    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    /**
     * Notify the bookable that it has a new booking.
     * This should only be called by Booking::addBookable().
     */
    public function bookingAdded(Booking $booking): void
    {
        $this->bookings->add($booking);
    }

    /**
     * Notify the bookable that it a booking was removed.
     * This should only be called by Booking::removeBookable().
     */
    public function bookingRemoved(Booking $booking): void
    {
        $this->bookings->removeElement($booking);
    }

    public function getLicenses(): Collection
    {
        return $this->licenses;
    }

    /**
     * Notify the bookable that it has a new license.
     * This should only be called by License::addBookable().
     */
    public function licenseAdded(License $license): void
    {
        $this->licenses->add($license);
    }

    /**
     * Notify the bookable that it a license was removed.
     * This should only be called by License::removeBookable().
     */
    public function licenseRemoved(License $license): void
    {
        $this->licenses->removeElement($license);
    }

    public function getInitialPrice(): Money
    {
        return $this->initialPrice;
    }

    public function setInitialPrice(Money $initialPrice): void
    {
        $this->initialPrice = $initialPrice;
    }

    public function getPeriodicPrice(): Money
    {
        return $this->periodicPrice;
    }

    public function setPeriodicPrice(Money $periodicPrice): void
    {
        $this->periodicPrice = $periodicPrice;
    }

    public function getPurchasePrice(): ?Money
    {
        return $this->purchasePrice;
    }

    public function setPurchasePrice(?Money $purchasePrice): void
    {
        $this->purchasePrice = $purchasePrice;
    }

    public function getSimultaneousBookingMaximum(): int
    {
        return $this->simultaneousBookingMaximum;
    }

    public function setSimultaneousBookingMaximum(int $simultaneousBookingMaximum): void
    {
        $this->simultaneousBookingMaximum = $simultaneousBookingMaximum;
    }

    /**
     * @API\Field(type="BookingType")
     */
    public function getBookingType(): string
    {
        return $this->bookingType;
    }

    /**
     * Whether this bookable can be booked.
     */
    public function isActive(): bool
    {
        return $this->isActive;
    }

    /**
     * Whether this bookable can be booked.
     */
    public function setIsActive(bool $isActive): void
    {
        $this->isActive = $isActive;
    }

    /**
     * @API\Input(type="BookingType")
     */
    public function setBookingType(string $state): void
    {
        $this->bookingType = $state;
    }

    /**
     * State of the bookable.
     *
     * @API\Field(type="BookableState")
     */
    public function getState(): string
    {
        return $this->state;
    }

    /**
     * State of the bookable.
     *
     * @API\Input(type="BookableState")
     */
    public function setState(string $state): void
    {
        $this->state = $state;
    }

    /**
     * The date then the bookable was last checked.
     */
    public function getVerificationDate(): ?Date
    {
        return $this->verificationDate;
    }

    /**
     * The date then the bookable was last checked.
     */
    public function setVerificationDate(?Date $verificationDate): void
    {
        $this->verificationDate = $verificationDate;
    }

    public function getBookableTags(): Collection
    {
        return $this->bookableTags;
    }

    /**
     * Notify the user that it has a new bookableTag.
     * This should only be called by BookableTag::addUser().
     */
    public function bookableTagAdded(BookableTag $bookableTag): void
    {
        $this->bookableTags->add($bookableTag);
    }

    /**
     * Notify the user that it a bookableTag was removed.
     * This should only be called by BookableTag::removeUser().
     */
    public function bookableTagRemoved(BookableTag $bookableTag): void
    {
        $this->bookableTags->removeElement($bookableTag);
    }

    public function getImage(): ?Image
    {
        return $this->image;
    }

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
     * The account to credit when booking this bookable.
     */
    public function getCreditAccount(): ?Account
    {
        return $this->creditAccount;
    }

    /**
     * The account to credit when booking this bookable.
     */
    public function setCreditAccount(?Account $creditAccount): void
    {
        $this->creditAccount = $creditAccount;
    }

    /**
     * Returns list of active bookings.
     *
     * Limits to admin-assigned, application and admin-approved
     *
     * @return Booking[]
     */
    public function getSharedBookings(): array
    {
        $bookableType = $this->getBookingType();
        $bookableTypesAllowed = [BookingTypeType::ADMIN_ASSIGNED, BookingTypeType::APPLICATION, BookingTypeType::ADMIN_APPROVED];

        if (!in_array($bookableType, $bookableTypesAllowed, true)) {
            return [];
        }

        // Only consider approved and unterminated bookings
        $bookings = $this->getBookings()->filter(fn (Booking $booking): bool => !$booking->getEndDate() && $booking->getStatus() !== BookingStatusType::APPLICATION)->toArray();

        return $bookings;
    }

    /**
     * Return a list of effective active bookings including sharing conditions.
     *
     * Only "admin-assigned" + storage tags are sharable bookables. In this case, a list of bookings is returned.
     *
     * For other bookable types, returns null
     *
     * @return Booking[]
     */
    public function getPeriodicPriceDividerBookings(): array
    {
        $isAdminAssigned = $this->getBookingType() === BookingTypeType::ADMIN_ASSIGNED;

        $isTagAllowed = false;
        $allowedTagIds = [BookableTagRepository::STORAGE_ID, BookableTagRepository::FORMATION_ID, BookableTagRepository::WELCOME_ID];
        foreach ($this->getBookableTags() as $tag) {
            if (in_array($tag->getId(), $allowedTagIds, true)) {
                $isTagAllowed = true;

                break;
            }
        }

        if (!$isAdminAssigned || !$isTagAllowed) {
            return [];
        }

        $bookings = $this->getBookings()->filter(fn (Booking $booking): bool => !$booking->getEndDate())->toArray();

        return $bookings;
    }
}
