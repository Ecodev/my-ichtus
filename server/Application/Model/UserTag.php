<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Repository\UserTagRepository;
use Application\Traits\HasColor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * A tag to be used on a user.
 */
#[ORM\UniqueConstraint(name: 'unique_name', columns: ['name'])]
#[ORM\Entity(UserTagRepository::class)]
class UserTag extends AbstractModel
{
    use HasColor;
    use HasName;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'userTags')]
    private Collection $users;

    public function __construct()
    {
        $this->users = new ArrayCollection();
    }

    public function getUsers(): Collection
    {
        return $this->users;
    }

    /**
     * Add user.
     */
    public function addUser(User $user): void
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->userTagAdded($this);
        }
    }

    /**
     * Remove user.
     */
    public function removeUser(User $user): void
    {
        $this->users->removeElement($user);
        $user->userTagRemoved($this);
    }
}
