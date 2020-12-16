<?php

declare(strict_types=1);

namespace Application\Handler;

use Application\Model\Image;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Handler\ImageHandler;
use Ecodev\Felix\Service\ImageResizer;
use Interop\Container\ContainerInterface;

class ImageFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $entityManager = $container->get(EntityManager::class);
        $imageService = $container->get(ImageResizer::class);

        return new ImageHandler($entityManager->getRepository(Image::class), $imageService);
    }
}
