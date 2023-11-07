<?php

declare(strict_types=1);

namespace Application\Traits;

use Doctrine\ORM\Mapping as ORM;
use Ecodev\Felix\Api\Scalar\ColorType;
use GraphQL\Doctrine\Attribute as API;

trait HasColor
{
    #[ORM\Column(type: 'string', length: 7, options: ['default' => ''])]
    private string $color = '';

    /**
     * Set color.
     */
    #[API\Input(type: ColorType::class)]
    public function setColor(string $color): void
    {
        $this->color = $color;
    }

    /**
     * Get color.
     */
    #[API\Field(type: ColorType::class)]
    public function getColor(): string
    {
        return $this->color;
    }
}
