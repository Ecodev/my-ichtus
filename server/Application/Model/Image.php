<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Repository\ImageRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * A card containing an image and some information about it.
 */
#[ORM\UniqueConstraint(name: 'unique_name', columns: ['filename'])]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(ImageRepository::class)]
class Image extends AbstractModel implements \Ecodev\Felix\Model\Image
{
    use \Ecodev\Felix\Model\Traits\Image;
}
