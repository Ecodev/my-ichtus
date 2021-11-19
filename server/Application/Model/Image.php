<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;

/**
 * A card containing an image and some information about it.
 *
 * @ORM\HasLifecycleCallbacks
 * @ORM\Entity(repositoryClass="Application\Repository\ImageRepository")
 * @ORM\Table(uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unique_name", columns={"filename"})
 * })
 */
class Image extends AbstractModel implements \Ecodev\Felix\Model\Image
{
    use \Ecodev\Felix\Model\Traits\Image;
}
