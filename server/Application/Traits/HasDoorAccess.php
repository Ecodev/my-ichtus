<?php

declare(strict_types=1);

namespace Application\Traits;

use Doctrine\ORM\Mapping as ORM;

/**
 * Access to all doors.
 */
trait HasDoorAccess
{
    #[ORM\Column(type: 'boolean', options: ['default' => 1])]
    private bool $door1 = true;

    #[ORM\Column(type: 'boolean', options: ['default' => 1])]
    private bool $door2 = true;

    #[ORM\Column(type: 'boolean', options: ['default' => 1])]
    private bool $door3 = true;

    #[ORM\Column(type: 'boolean', options: ['default' => 0])]
    private bool $door4 = false;

    public function getDoor1(): bool
    {
        return $this->door1;
    }

    public function setDoor1(bool $door1): void
    {
        $this->door1 = $door1;
    }

    public function getDoor2(): bool
    {
        return $this->door2;
    }

    public function setDoor2(bool $door2): void
    {
        $this->door2 = $door2;
    }

    public function getDoor3(): bool
    {
        return $this->door3;
    }

    public function setDoor3(bool $door3): void
    {
        $this->door3 = $door3;
    }

    public function getDoor4(): bool
    {
        return $this->door4;
    }

    public function setDoor4(bool $door4): void
    {
        $this->door4 = $door4;
    }
}
