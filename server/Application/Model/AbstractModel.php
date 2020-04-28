<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Acl\Acl;
use Application\Api\Exception;
use Application\Utility;
use Cake\Chronos\Chronos;
use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;

/**
 * Base class for all objects stored in database.
 *
 * It includes an automatic mechanism to timestamp objects with date and user.
 *
 * @ORM\MappedSuperclass
 * @ORM\HasLifecycleCallbacks
 * @API\Filters({
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\SearchOperatorType", type="string"),
 * })
 * @API\Sorting({
 *     "Application\Api\Input\Sorting\LatestModification",
 *     "Application\Api\Input\Sorting\Owner"
 * })
 */
abstract class AbstractModel
{
    /**
     * @var int
     *
     * @ORM\Column(type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var Chronos
     *
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $creationDate;

    /**
     * @var Chronos
     *
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $updateDate;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="SET NULL")
     * })
     */
    private $creator;

    /**
     * @var null|User
     *
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="SET NULL")
     * })
     */
    private $owner;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="SET NULL")
     * })
     */
    private $updater;

    /**
     * Get id
     *
     * @return null|int
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Set creation date
     *
     * @param Chronos $creationDate
     */
    protected function setCreationDate(Chronos $creationDate = null): void
    {
        $this->creationDate = $creationDate;
    }

    /**
     * Get creation date
     *
     * @return null|Chronos
     */
    public function getCreationDate(): ?Chronos
    {
        return $this->creationDate;
    }

    /**
     * Set update date
     *
     * @param Chronos $updateDate
     */
    private function setUpdateDate(Chronos $updateDate = null): void
    {
        $this->updateDate = $updateDate;
    }

    /**
     * Get update date
     *
     * @return null|Chronos
     */
    public function getUpdateDate(): ?Chronos
    {
        return $this->updateDate;
    }

    /**
     * Set creator
     *
     * @param User $creator
     */
    protected function setCreator(User $creator = null): void
    {
        $this->creator = $creator;
    }

    /**
     * Get creator
     *
     * @return null|User
     */
    public function getCreator(): ?User
    {
        return $this->creator;
    }

    /**
     * Set owner
     *
     * @param null|User $owner
     */
    public function setOwner(?User $owner): void
    {
        if ($owner === $this->owner) {
            return;
        }

        $user = User::getCurrent();
        $isAdmin = $user && $user->getRole() === User::ROLE_ADMINISTRATOR;
        $isOwner = $user === $this->owner;

        if ($this->owner && !$isAdmin && !$isOwner) {
            $currentLogin = $user ? $user->getLogin() : '[anonymous]';
            $currentOwnerLogin = $this->owner->getLogin();
            $futureOwnerLogin = $owner ? $owner->getLogin() : '[nobody]';

            throw new Exception($currentLogin . ' is not allowed to change owner to ' . $futureOwnerLogin . ' because it belongs to ' . $currentOwnerLogin);
        }

        $this->owner = $owner;
    }

    /**
     * Get owner
     *
     * @return null|User
     */
    public function getOwner(): ?User
    {
        return $this->owner;
    }

    /**
     * Set updater
     *
     * @param null|User $updater
     */
    private function setUpdater(User $updater = null): void
    {
        $this->updater = $updater;
    }

    /**
     * Get updater
     *
     * @return null|User
     */
    public function getUpdater(): ?User
    {
        return $this->updater;
    }

    /**
     * Get default owner for creation
     *
     * @return null|User
     */
    public function getOwnerForCreation(): ?User
    {
        return User::getCurrent();
    }

    /**
     * Automatically called by Doctrine when the object is saved for the first time
     *
     * @ORM\PrePersist
     */
    public function timestampCreation(): void
    {
        $this->setCreationDate(Utility::getNow());
        $this->setCreator(User::getCurrent());

        if (!$this->getOwner()) {
            $this->setOwner($this->getOwnerForCreation());
        }
    }

    /**
     * Automatically called by Doctrine when the object is updated
     *
     * @ORM\PreUpdate
     */
    public function timestampUpdate(): void
    {
        $this->setUpdateDate(Utility::getNow());
        $this->setUpdater(User::getCurrent());
    }

    /**
     * Get permissions on this object for the current user
     *
     * @API\Field(type="Permissions")
     *
     * @return array
     */
    public function getPermissions(): array
    {
        $acl = new Acl();

        return [
            'create' => $acl->isCurrentUserAllowed($this, 'create'),
            'read' => $acl->isCurrentUserAllowed($this, 'read'),
            'update' => $acl->isCurrentUserAllowed($this, 'update'),
            'delete' => $acl->isCurrentUserAllowed($this, 'delete'),
        ];
    }
}
