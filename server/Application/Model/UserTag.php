<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Traits\HasColor;
use Application\Traits\HasName;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * A tag to be used on a user.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\UserTagRepository")
 * @ORM\Table(uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unique_name", columns={"name"})
 * })
 */
class UserTag extends AbstractModel
{
    use HasName;
    use HasColor;

    /**
     * @var Collection
     * @ORM\ManyToMany(targetEntity="User", inversedBy="userTags")
     */
    private $users;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->users = new ArrayCollection();
    }

    /**
     * @return Collection
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    /**
     * Add user
     *
     * @param User $user
     */
    public function addUser(User $user): void
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->userTagAdded($this);
        }
    }

    /**
     * Remove user
     *
     * @param User $user
     */
    public function removeUser(User $user): void
    {
        $this->users->removeElement($user);
        $user->userTagRemoved($this);
    }
}
