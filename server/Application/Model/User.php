<?php

declare(strict_types=1);

namespace Application\Model;

use Application\DBAL\Types\BillingTypeType;
use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\RelationshipType;
use Application\Repository\LogRepository;
use Application\Repository\UserRepository;
use Application\Service\Role;
use Application\Traits\HasAddress;
use Application\Traits\HasDoorAccess;
use Application\Traits\HasIban;
use Application\Traits\HasRemarks;
use Cake\Chronos\Chronos;
use Cake\Chronos\Date;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Model\CurrentUser;
use Ecodev\Felix\Model\Traits\HasInternalRemarks;
use Ecodev\Felix\Model\Traits\HasPassword;
use GraphQL\Doctrine\Annotation as API;

/**
 * User.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\UserRepository")
 * @ORM\HasLifecycleCallbacks
 * @ORM\AssociationOverrides({
 *     @ORM\AssociationOverride(name="owner", inversedBy="users")
 * })
 * @API\Sorting({
 *     "Application\Api\Input\Sorting\Age",
 *     "Application\Api\Input\Sorting\Balance",
 * })
 * @API\Filters({
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\HasBookingWithTaggedBookableOperatorType", type="id"),
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\HasBookingWithBookableOperatorType", type="id"),
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\HasBookingStatusOperatorType", type="id"),
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\HasBookingCompletedOperatorType", type="boolean"),
 *     @API\Filter(field="bookingCount", operator="Application\Api\Input\Operator\BookingCount\BookingCountEqualOperatorType", type="int"),
 *     @API\Filter(field="bookingCount", operator="Application\Api\Input\Operator\BookingCount\BookingCountGreaterOperatorType", type="int"),
 *     @API\Filter(field="bookingCount", operator="Application\Api\Input\Operator\BookingCount\BookingCountGreaterOrEqualOperatorType", type="int"),
 *     @API\Filter(field="bookingCount", operator="Application\Api\Input\Operator\BookingCount\BookingCountLessOperatorType", type="int"),
 *     @API\Filter(field="bookingCount", operator="Application\Api\Input\Operator\BookingCount\BookingCountLessOrEqualOperatorType", type="int"),
 *     @API\Filter(field="balance", operator="Application\Api\Input\Operator\AccountBalance\EqualOperatorType", type="Money"),
 *     @API\Filter(field="balance", operator="Application\Api\Input\Operator\AccountBalance\GreaterOperatorType", type="Money"),
 *     @API\Filter(field="balance", operator="Application\Api\Input\Operator\AccountBalance\GreaterOrEqualOperatorType", type="Money"),
 *     @API\Filter(field="balance", operator="Application\Api\Input\Operator\AccountBalance\LessOperatorType", type="Money"),
 *     @API\Filter(field="balance", operator="Application\Api\Input\Operator\AccountBalance\LessOrEqualOperatorType", type="Money"),
 *     @API\Filter(field="bookingDate", operator="Application\Api\Input\Operator\BookingDate\BookingDateEqualOperatorType", type="Date"),
 *     @API\Filter(field="bookingDate", operator="Application\Api\Input\Operator\BookingDate\BookingDateGreaterOperatorType", type="Date"),
 *     @API\Filter(field="bookingDate", operator="Application\Api\Input\Operator\BookingDate\BookingDateGreaterOrEqualOperatorType", type="Date"),
 *     @API\Filter(field="bookingDate", operator="Application\Api\Input\Operator\BookingDate\BookingDateLessOperatorType", type="Date"),
 *     @API\Filter(field="bookingDate", operator="Application\Api\Input\Operator\BookingDate\BookingDateLessOrEqualOperatorType", type="Date"),
 * })
 */
class User extends AbstractModel implements \Ecodev\Felix\Model\User
{
    final public const ROLE_ANONYMOUS = 'anonymous';
    final public const ROLE_BOOKING_ONLY = 'booking_only';
    final public const ROLE_INDIVIDUAL = 'individual';
    final public const ROLE_ACCOUNTING_VERIFICATOR = 'accounting_verificator';
    final public const ROLE_MEMBER = 'member';
    final public const ROLE_TRAINER = 'trainer';
    final public const ROLE_FORMATION_RESPONSIBLE = 'formation_responsible';
    final public const ROLE_RESPONSIBLE = 'responsible';
    final public const ROLE_ADMINISTRATOR = 'administrator';

    final public const STATUS_INACTIVE = 'inactive';
    final public const STATUS_NEW = 'new';
    final public const STATUS_ACTIVE = 'active';
    final public const STATUS_ARCHIVED = 'archived';

    use HasAddress;
    use HasDoorAccess;
    use HasIban;
    use HasInternalRemarks;
    use HasPassword;
    use HasRemarks;

    private static ?User $currentUser = null;

    /**
     * Set currently logged in user
     * WARNING: this method should only be called from \Application\Authentication\AuthenticationListener.
     *
     * @param User $user
     */
    public static function setCurrent(?self $user): void
    {
        self::$currentUser = $user;

        // Initalize ACL filter with current user if a logged in one exists
        /** @var UserRepository $userRepository */
        $userRepository = _em()->getRepository(self::class);
        $aclFilter = $userRepository->getAclFilter();
        $aclFilter->setUser($user);

        CurrentUser::set($user);
    }

    /**
     * Returns currently logged user or null.
     */
    public static function getCurrent(): ?self
    {
        return self::$currentUser;
    }

    /**
     * @ORM\Column(type="string", length=50, nullable=true, unique=true)
     */
    private ?string $login = null;

    /**
     * @ORM\Column(type="string", length=191)
     */
    private string $firstName = '';

    /**
     * @ORM\Column(type="string", length=191)
     */
    private string $lastName = '';

    /**
     * @ORM\Column(type="string", length=191, nullable=true, unique=true)
     */
    private ?string $email = null;

    /**
     * @ORM\Column(type="UserRole", options={"default" = User::ROLE_INDIVIDUAL})
     */
    private string $role = self::ROLE_INDIVIDUAL;

    /**
     * @ORM\Column(type="UserStatus", options={"default" = User::STATUS_NEW})
     */
    private string $status = self::STATUS_NEW;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private ?Chronos $welcomeSessionDate = null;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private ?Chronos $resignDate = null;

    /**
     * @var int sex
     * @ORM\Column(type="smallint", options={"default" = 0}))
     */
    private int $sex = 0;

    /**
     * @ORM\Column(type="string", length=25, options={"default" = ""})
     */
    private string $phone = '';

    /**
     * @ORM\Column(type="string", length=25, options={"default" = ""})
     */
    private string $mobilePhone = '';

    /**
     * @ORM\Column(type="string", length=25, options={"default" = ""})
     */
    private string $swissSailing = '';

    /**
     * @ORM\Column(type="SwissSailingType", nullable=true)
     */
    private ?string $swissSailingType = null;

    /**
     * @ORM\Column(type="SwissWindsurfType", nullable=true)
     */
    private ?string $swissWindsurfType = null;

    /**
     * @ORM\Column(type="date", nullable=true)
     */
    private ?Date $birthday = null;

    /**
     * @ORM\Column(type="boolean", options={"default" = 0})
     */
    private bool $termsAgreement = false;

    /**
     * @ORM\Column(type="boolean", options={"default" = 0})
     */
    private bool $hasInsurance = false;

    /**
     * @ORM\Column(type="boolean", options={"default" = 0})
     */
    private bool $receivesNewsletter = false;

    /**
     * @ORM\Column(type="Relationship", options={"default" = RelationshipType::HOUSEHOLDER})
     */
    private string $familyRelationship = RelationshipType::HOUSEHOLDER;

    /**
     * @ORM\Column(type="BillingType", options={"default" = BillingTypeType::ELECTRONIC})
     */
    private string $billingType = BillingTypeType::ELECTRONIC;

    /**
     * @var Collection<Booking>
     * @ORM\OneToMany(targetEntity="Booking", mappedBy="owner")
     */
    private Collection $bookings;

    /**
     * @var Collection<License>
     * @ORM\ManyToMany(targetEntity="License", mappedBy="users")
     */
    private Collection $licenses;

    /**
     * @var Collection<UserTag>
     * @ORM\ManyToMany(targetEntity="UserTag", mappedBy="users")
     */
    private Collection $userTags;

    /**
     * @var Collection<Message>
     * @ORM\OneToMany(targetEntity="Message", mappedBy="recipient")
     */
    private Collection $messages;

    /**
     * There is actually 0 to 1 account, never more. And this is
     * enforced by DB unique constraints.
     *
     * @var Collection<Account>
     * @ORM\OneToMany(targetEntity="Account", mappedBy="owner")
     */
    private Collection $accounts;

    /**
     * @var Collection<User>
     * @ORM\OneToMany(targetEntity="User", mappedBy="owner")
     */
    private Collection $users;

    /**
     * Constructor.
     *
     * @param string $role role for new user
     */
    public function __construct(string $role = self::ROLE_INDIVIDUAL)
    {
        $this->role = $role;
        $this->bookings = new ArrayCollection();
        $this->accounts = new ArrayCollection();
        $this->licenses = new ArrayCollection();
        $this->userTags = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->users = new ArrayCollection();
    }

    /**
     * Set login (eg: johndoe).
     *
     * @API\Input(type="Login")
     */
    public function setLogin(string $login): void
    {
        $this->login = $login;
    }

    /**
     * Get login (eg: johndoe).
     *
     * @API\Field(type="?Login")
     */
    public function getLogin(): ?string
    {
        return $this->login;
    }

    /**
     * Set first name.
     */
    public function setFirstName(string $firstName): void
    {
        $this->firstName = $firstName;
    }

    /**
     * Get first name.
     */
    public function getFirstName(): string
    {
        return $this->firstName;
    }

    /**
     * Set last name.
     */
    public function setLastName(string $lastName): void
    {
        $this->lastName = $lastName;
    }

    /**
     * Get last name.
     */
    public function getLastName(): string
    {
        return $this->lastName;
    }

    /**
     * Get full name.
     */
    public function getName(): string
    {
        return implode(' ', [$this->getFirstName(), $this->getLastName()]);
    }

    /**
     * Set email.
     *
     * @API\Input(type="?Email")
     */
    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    /**
     * Get email.
     *
     * @API\Field(type="?Email")
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * Get the user role.
     *
     * @API\Field(type="UserRole")
     */
    public function getRole(): string
    {
        return $this->role;
    }

    /**
     * Sets the user role.
     *
     * @API\Input(type="UserRole")
     */
    public function setRole(string $role): void
    {
        if (!Role::canUpdate(self::getCurrent(), $this->role, $role)) {
            $currentRole = self::getCurrent() ? self::getCurrent()->getRole() : self::ROLE_ANONYMOUS;

            throw new Exception($currentRole . ' is not allowed to change role from ' . $this->role . ' to ' . $role);
        }

        $this->role = $role;
    }

    public function setOwner(?self $owner = null): void
    {
        if ($owner === $this) {
            throw new Exception('This user cannot be owned by himself');
        }

        if ($owner && $owner->getOwner()) {
            throw new Exception('This user cannot be owned by a user who is himself owned by somebody else');
        }

        if ($owner && $this->users->count()) {
            throw new Exception('This user owns other users, so he cannot himself be owned by somebody else');
        }

        if ($this->getOwner()) {
            $this->getOwner()->getEmail(); // Trigger lazy loading
            $this->getOwner()->users->removeElement($this);
        }

        parent::setOwner($owner);

        if ($this->getOwner()) {
            $this->getOwner()->getEmail(); // Trigger lazy loading
            $this->getOwner()->users->add($this);
            $this->setStatus($this->getOwner()->getStatus());
        }
    }

    /**
     * @API\Field(type="Application\Api\Enum\UserStatusType")
     */
    public function getStatus(): string
    {
        return $this->status;
    }

    /**
     * @API\Input(type="Application\Api\Enum\UserStatusType")
     */
    public function setStatus(string $newStatus): void
    {
        if ($newStatus === self::STATUS_ARCHIVED && $this->status !== self::STATUS_ARCHIVED) {
            $this->setResignDate(Chronos::NOW());
        } elseif ($this->status === self::STATUS_ARCHIVED && $newStatus !== self::STATUS_ARCHIVED) {
            $this->setResignDate(null);
        }

        $this->status = $newStatus;
        $this->revokeToken();

        foreach ($this->users as $user) {
            if ($user !== $this) {
                $user->setStatus($newStatus);
            }
        }
    }

    /**
     * Whether this user is a family owner or not.
     *
     * This is used for our internal logic and should
     * NEVER be related to `familyRelationship`. That field
     * is purely informative for humans.
     */
    public function isFamilyOwner(): bool
    {
        return !$this->getOwner();
    }

    public function initialize(): void
    {
        $this->role = self::ROLE_MEMBER; // Bypass security
        $this->setStatus(self::STATUS_NEW);
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): void
    {
        $this->phone = $phone;
    }

    public function getMobilePhone(): string
    {
        return $this->mobilePhone;
    }

    public function setMobilePhone(string $mobilePhone): void
    {
        $this->mobilePhone = $mobilePhone;
    }

    public function getBirthday(): ?Date
    {
        return $this->birthday;
    }

    public function setBirthday(?Date $birthday): void
    {
        $this->birthday = $birthday;
    }

    /**
     * return null|int.
     */
    public function getAge(): ?int
    {
        if ($this->birthday) {
            return (new Date())->diffInYears($this->birthday);
        }

        return null;
    }

    /**
     * Get bookings.
     */
    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    /**
     * Get active bookings (confirmed and non-terminated).
     *
     * @API\Exclude
     */
    public function getRunningBookings(): Collection
    {
        return $this->bookings->filter(fn (Booking $booking) => $booking->getStatus() === BookingStatusType::BOOKED && $booking->getEndDate() === null);
    }

    /**
     * Notify the user that it has a new booking.
     * This should only be called by Booking::setResponsible().
     */
    public function bookingAdded(Booking $booking): void
    {
        $this->bookings->add($booking);
    }

    /**
     * Notify the user that it has a booking was removed.
     * This should only be called by Booking::setResponsible().
     */
    public function bookingRemoved(Booking $booking): void
    {
        $this->bookings->removeElement($booking);
    }

    public function getLicenses(): Collection
    {
        return $this->licenses;
    }

    public function getUserTags(): Collection
    {
        return $this->userTags;
    }

    /**
     * Notify the user that it has a new license.
     * This should only be called by License::addUser().
     */
    public function licenseAdded(License $license): void
    {
        $this->licenses->add($license);
    }

    /**
     * Notify the user that it a license was removed.
     * This should only be called by License::removeUser().
     */
    public function licenseRemoved(License $license): void
    {
        $this->licenses->removeElement($license);
    }

    /**
     * Notify the user that it has a new userTag.
     * This should only be called by UserTag::addUser().
     */
    public function userTagAdded(UserTag $userTag): void
    {
        $this->userTags->add($userTag);
    }

    /**
     * Notify the user that a userTag was removed.
     * This should only be called by UserTag::removeUser().
     */
    public function userTagRemoved(UserTag $userTag): void
    {
        $this->userTags->removeElement($userTag);
    }

    public function isTermsAgreement(): bool
    {
        return $this->termsAgreement;
    }

    public function setTermsAgreement(bool $termsAgreement): void
    {
        $this->termsAgreement = $termsAgreement;
    }

    public function hasInsurance(): bool
    {
        return $this->hasInsurance;
    }

    public function setHasInsurance(bool $hasInsurance): void
    {
        $this->hasInsurance = $hasInsurance;
    }

    public function getWelcomeSessionDate(): ?Chronos
    {
        return $this->welcomeSessionDate;
    }

    public function setWelcomeSessionDate(?Chronos $welcomeSessionDate): void
    {
        $this->welcomeSessionDate = $welcomeSessionDate;
    }

    public function getResignDate(): ?Chronos
    {
        return $this->resignDate;
    }

    public function setResignDate(?Chronos $resignDate): void
    {
        $this->resignDate = $resignDate;
    }

    public function getReceivesNewsletter(): bool
    {
        return $this->receivesNewsletter;
    }

    public function setReceivesNewsletter(bool $receivesNewsletter): void
    {
        $this->receivesNewsletter = $receivesNewsletter;
    }

    /**
     * Get the sex.
     *
     * @API\Field(type="Sex")
     */
    public function getSex(): int
    {
        return $this->sex;
    }

    /**
     * Set the sex.
     *
     * @API\Input(type="Sex")
     */
    public function setSex(int $sex): void
    {
        $this->sex = $sex;
    }

    /**
     * Get the Swiss Sailing licence number.
     */
    public function getSwissSailing(): string
    {
        return $this->swissSailing;
    }

    public function setSwissSailing(string $swissSailing): void
    {
        $this->swissSailing = $swissSailing;
    }

    /**
     * Get the Swiss Sailing licence type.
     *
     * @API\Field(type="?SwissSailingType")
     */
    public function getSwissSailingType(): ?string
    {
        return $this->swissSailingType;
    }

    /**
     * Set the Swiss Sailing licence type.
     *
     * @API\Input(type="?SwissSailingType")
     */
    public function setSwissSailingType(?string $swissSailingType): void
    {
        $this->swissSailingType = $swissSailingType;
    }

    /**
     * Get the Swiss Windsurf licence type.
     *
     * @API\Field(type="?SwissWindsurfType")
     */
    public function getSwissWindsurfType(): ?string
    {
        return $this->swissWindsurfType;
    }

    /**
     * Set the Swiss Windsurf licence type.
     *
     * @API\Input(type="?SwissWindsurfType")
     */
    public function setSwissWindsurfType(?string $swissWindsurfType): void
    {
        $this->swissWindsurfType = $swissWindsurfType;
    }

    /**
     * Get the first login date.
     */
    public function getFirstLogin(): ?Chronos
    {
        /** @var LogRepository $logRepository */
        $logRepository = _em()->getRepository(Log::class);

        return $logRepository->getLoginDate($this, true);
    }

    /**
     * Get the last login date.
     */
    public function getLastLogin(): ?Chronos
    {
        /** @var LogRepository $logRepository */
        $logRepository = _em()->getRepository(Log::class);

        return $logRepository->getLoginDate($this, false);
    }

    /**
     * @API\Field(type="Relationship")
     */
    public function getFamilyRelationship(): string
    {
        return $this->familyRelationship;
    }

    /**
     * @API\Input(type="Relationship")
     */
    public function setFamilyRelationship(string $familyRelationship): void
    {
        $this->familyRelationship = $familyRelationship;
    }

    /**
     * @API\Field(type="BillingType")
     */
    public function getBillingType(): string
    {
        return $this->billingType;
    }

    /**
     * @API\Input(type="BillingType")
     */
    public function setBillingType(string $billingType): void
    {
        $this->billingType = $billingType;
    }

    /**
     * Get the user transaction account.
     */
    public function getAccount(): ?Account
    {
        if ($this->getOwner() && $this->getOwner() !== $this) {
            return $this->getOwner()->getAccount();
        }

        return $this->accounts->count() ? $this->accounts->first() : null;
    }

    /**
     * Notify the user that it has a new account
     * This should only be called by Account::setOwner().
     */
    public function accountAdded(Account $account): void
    {
        $this->accounts->clear();
        $this->accounts->add($account);
    }

    /**
     * Notify the user that a account was removed
     * This should only be called by Account::setOwner().
     */
    public function accountRemoved(): void
    {
        $this->accounts->clear();
    }

    /**
     * Get messages sent to the user.
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    /**
     * Notify the user that it has a new message
     * This should only be called by Message::setRecipient().
     */
    public function messageAdded(Message $message): void
    {
        $this->messages->add($message);
    }

    /**
     * Notify the user that a message was removed
     * This should only be called by Message::setRecipient().
     */
    public function messageRemoved(Message $message): void
    {
        $this->messages->removeElement($message);
    }

    /**
     * Check if the user can *really* open a door
     * This also takes into account the user status and role.
     *
     * @API\Field(args={@API\Argument(name="door", type="?Application\Api\Enum\DoorType")})
     *
     * @param null|string $door a particular door, or null for any
     */
    public function getCanOpenDoor(?string $door = null): bool
    {
        $allowedStatus = [self::STATUS_ACTIVE];
        $allowedRoles = [
            self::ROLE_ACCOUNTING_VERIFICATOR,
            self::ROLE_INDIVIDUAL,
            self::ROLE_MEMBER,
            self::ROLE_TRAINER,
            self::ROLE_FORMATION_RESPONSIBLE,
            self::ROLE_RESPONSIBLE,
            self::ROLE_ADMINISTRATOR,
        ];

        if ($door && !$this->$door) {
            return false;
        }

        if (!in_array($this->status, $allowedStatus, true) || !in_array($this->role, $allowedRoles, true)) {
            return false;
        }

        return true;
    }

    /**
     * Override parent to prevents users created from administration to be family of the administrator.
     *
     * The owner must be explicitly set for all users.
     */
    protected function getOwnerForCreation(): ?self
    {
        return null;
    }
}
