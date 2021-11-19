<?php

declare(strict_types=1);

namespace Application\Traits;

use GraphQL\Doctrine\Annotation as API;

trait HasColor
{
    /**
     * @var string
     *
     * @ORM\Column(type="string", length=7, options={"default" = ""}))
     */
    private $color = '';

    /**
     * Set color.
     *
     * @API\Input(type="Color")
     */
    public function setColor(string $color): void
    {
        $this->color = $color;
    }

    /**
     * Get color.
     *
     * @API\Field(type="Color")
     */
    public function getColor(): string
    {
        return $this->color;
    }
}
