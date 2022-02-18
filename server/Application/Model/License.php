<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Model\Traits\HasName;

/**
 * A license that is required for a booking and can be owned by a user.
 *
 * @ORM\Entity(repositoryClass="Application\Repository\LicenseRepository")
 * @ORM\Table(uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unique_name", columns={"name"})
 * })
 */
class License extends AbstractModel
{
    use HasName;

    /**
     * @var Collection<Bookable>
     * @ORM\ManyToMany(targetEntity="Bookable", inversedBy="licenses")
     */
    private Collection $bookables;

    /**
     * @var Collection<User>
     * @ORM\ManyToMany(targetEntity="User", inversedBy="licenses")
     */
    private Collection $users;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->bookables = new ArrayCollection();
        $this->users = new ArrayCollection();
    }

    public function getBookables(): Collection
    {
        return $this->bookables;
    }

    /**
     * Add bookable.
     */
    public function addBookable(Bookable $bookable): void
    {
        if (!$this->bookables->contains($bookable)) {
            $this->bookables->add($bookable);
            $bookable->licenseAdded($this);
        }
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
            $user->licenseAdded($this);
        }
    }

    /**
     * Remove user.
     */
    public function removeUser(User $user): void
    {
        $this->users->removeElement($user);
        $user->licenseRemoved($this);
    }

    /**
     * Remove bookable.
     */
    public function removeBookable(Bookable $bookable): void
    {
        $this->bookables->removeElement($bookable);
        $bookable->licenseRemoved($this);
    }
}
