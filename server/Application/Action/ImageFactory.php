<?php

declare(strict_types=1);

namespace Application\Action;

use Application\Model\Image;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Action\ImageAction;
use Ecodev\Felix\Service\ImageResizer;
use Interop\Container\ContainerInterface;

class ImageFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $entityManager = $container->get(EntityManager::class);
        $imageService = $container->get(ImageResizer::class);

        return new ImageAction($entityManager->getRepository(Image::class), $imageService);
    }
}
