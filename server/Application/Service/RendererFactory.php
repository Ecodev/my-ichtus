<?php

declare(strict_types=1);

namespace Application\Service;

use Interop\Container\ContainerInterface;
use Laminas\View\Renderer\PhpRenderer;
use Laminas\View\Renderer\RendererInterface;
use Laminas\View\Resolver\TemplatePathStack;

class RendererFactory
{
    /**
     * Return a configured mailer
     *
     * @param ContainerInterface $container
     *
     * @return RendererInterface
     */
    public function __invoke(ContainerInterface $container): RendererInterface
    {
        $renderer = new PhpRenderer();
        $resolver = new TemplatePathStack();
        $resolver->addPath('server/templates/emails');
        $renderer->setResolver($resolver);

        return $renderer;
    }
}
