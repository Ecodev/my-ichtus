<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountEqualOperatorType;
use Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountGreaterOperatorType;
use Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountGreaterOrEqualOperatorType;
use Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountLessOperatorType;
use Application\Api\Input\Operator\BookableBookingCount\BookableBookingCountLessOrEqualOperatorType;
use Application\Api\Input\Operator\BookableUsageOperatorType;
use Application\Enum\BookableState;
use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
use Application\Repository\BookableRepository;
use Application\Repository\BookableTagRepository;
use Application\Traits\HasCode;
use Application\Traits\HasRemarks;
use Cake\Chronos\ChronosDate;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasDescription;
use Ecodev\Felix\Model\Traits\HasName;
use GraphQL\Doctrine\Attribute as API;
use Money\Money;

/**
 * An item that can be booked by a user.
 */
#[API\Filter(field: 'custom', operator: BookableUsageOperatorType::class, type: 'id')]
#[API\Filter(field: 'bookableBookingCount', operator: BookableBookingCountEqualOperatorType::class, type: 'int')]
#[API\Filter(field: 'bookableBookingCount', operator: BookableBookingCountGreaterOperatorType::class, type: 'int')]
#[API\Filter(field: 'bookableBookingCount', operator: BookableBookingCountGreaterOrEqualOperatorType::class, type: 'int')]
#[API\Filter(field: 'bookableBookingCount', operator: BookableBookingCountLessOperatorType::class, type: 'int')]
#[API\Filter(field: 'bookableBookingCount', operator: BookableBookingCountLessOrEqualOperatorType::class, type: 'int')]
#[ORM\Entity(BookableRepository::class)]
class Bookable extends AbstractModel
{
    use HasCode;
    use HasDescription;
    use HasName;
    use HasRemarks;

    #[ORM\Column(type: 'Money', options: ['default' => 0])]
    private Money $initialPrice;

    #[ORM\Column(type: 'Money', options: ['default' => 0])]
    private Money $periodicPrice;

    #[ORM\Column(type: 'Money', nullable: true, options: ['unsigned' => true])]
    private ?Money $purchasePrice = null;

    #[ORM\Column(type: 'smallint', options: ['default' => -1])]
    private int $simultaneousBookingMaximum = 1;

    #[ORM\Column(type: 'smallint', options: ['default' => 0, 'unsigned' => true])]
    private int $waitingListLength = 0;

    #[ORM\Column(type: 'BookingType', length: 10, options: ['default' => BookingType::AdminApproved])]
    private BookingType $bookingType = BookingType::AdminApproved;

    #[ORM\Column(type: 'boolean', options: ['default' => 1])]
    private bool $isActive = true;

    #[ORM\Column(type: 'BookableState', length: 10, options: ['default' => BookableState::Good])]
    private BookableState $state = BookableState::Good;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?ChronosDate $verificationDate = null;

    /**
     * @var Collection<int, BookableTag>
     */
    #[ORM\ManyToMany(targetEntity: BookableTag::class, mappedBy: 'bookables')]
    private Collection $bookableTags;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'bookable')]
    private Collection $bookings;

    /**
     * @var Collection<int, License>
     */
    #[ORM\ManyToMany(targetEntity: License::class, mappedBy: 'bookables')]
    private Collection $licenses;

    #[ORM\OneToOne(targetEntity: Image::class, orphanRemoval: true)]
    #[ORM\JoinColumn(name: 'image_id', referencedColumnName: 'id')]
    private ?Image $image = null;

    #[ORM\JoinColumn(onDelete: 'CASCADE')]
    #[ORM\ManyToOne(targetEntity: Account::class)]
    private ?Account $creditAccount = null;

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

    public function getBookingType(): BookingType
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

    public function setBookingType(BookingType $state): void
    {
        $this->bookingType = $state;
    }

    /**
     * State of the bookable.
     */
    public function getState(): BookableState
    {
        return $this->state;
    }

    /**
     * State of the bookable.
     */
    public function setState(BookableState $state): void
    {
        $this->state = $state;
    }

    /**
     * The date then the bookable was last checked.
     */
    public function getVerificationDate(): ?ChronosDate
    {
        return $this->verificationDate;
    }

    /**
     * The date then the bookable was last checked.
     */
    public function setVerificationDate(?ChronosDate $verificationDate): void
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
     * Returns list of active, non-application, bookings. But only if the bookable has a limit of simultaneous booking. Otherwise, returns empty list.
     *
     * @return Booking[]
     */
    public function getSimultaneousBookings(): array
    {
        // Pretend to have no simultaneous bookings to avoid too many SQL queries when we don't really care about it
        if ($this->avoidTooManySqlQueries()) {
            return [];
        }

        // Only consider approved and unterminated bookings
        $bookings = $this->getBookings()->filter(fn (Booking $booking): bool => !$booking->getEndDate() && $booking->getStatus() !== BookingStatus::Application)->toArray();

        return $bookings;
    }

    /**
     * Returns list of active, non-application, bookings. But only if the bookable has a limit of simultaneous booking. Otherwise, returns empty list.
     *
     * @return Booking[]
     */
    public function getSimultaneousApplications(): array
    {
        // Pretend to have no simultaneous bookings to avoid too many SQL queries when we don't really care about it
        if ($this->avoidTooManySqlQueries()) {
            return [];
        }

        $bookableType = $this->getBookingType();
        $bookableTypesAllowed = [BookingType::AdminAssigned, BookingType::Application, BookingType::AdminApproved];

        if (!in_array($bookableType, $bookableTypesAllowed, true)) {
            return [];
        }

        // Only consider approved and unterminated bookings
        $bookings = $this->getBookings()->filter(fn (Booking $booking): bool => !$booking->getEndDate() && $booking->getStatus() === BookingStatus::Application)->toArray();

        return $bookings;
    }

    private function avoidTooManySqlQueries(): bool
    {
        $bookableType = $this->getBookingType();
        $bookableTypesAllowed = [BookingType::AdminAssigned, BookingType::Application, BookingType::AdminApproved];

        return !in_array($bookableType, $bookableTypesAllowed, true);
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
        $isAdminAssigned = $this->getBookingType() === BookingType::AdminAssigned;

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

    /**
     * If non-zero, it allows creating more application bookings, even if the bookable reached its
     * simultaneousBookingMaximum. So in effect, it will be a sort of "waiting list" of people who would like to
     * participate in case of someone else canceling their booking.
     */
    public function getWaitingListLength(): int
    {
        return $this->waitingListLength;
    }

    public function setWaitingListLength(int $waitingListLength): void
    {
        $this->waitingListLength = $waitingListLength;
    }
}
