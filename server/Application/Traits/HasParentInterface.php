<?php

declare(strict_types=1);

namespace Application\Traits;

use Doctrine\Common\Collections\Collection;

/**
 * Any object which has a parent, modeling a hierarchy of objects.
 */
interface HasParentInterface
{
    /**
     * Returns the parent containing this object, or null if this is a root object.
     */
    public function getParent(): ?self;

    /**
     * Set the parent containing this object.
     */
    public function setParent(?self $parent): void;

    /**
     * Get children.
     */
    public function getChildren(): Collection;
}
