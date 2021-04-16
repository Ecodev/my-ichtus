<?php

declare(strict_types=1);

namespace Application\Handler;

use Application\Model\AccountingDocument;
use Doctrine\ORM\EntityManager;
use Interop\Container\ContainerInterface;

class AccountingDocumentFactory
{
    public function __invoke(ContainerInterface $container): AccountingDocumentHandler
    {
        $entityManager = $container->get(EntityManager::class);

        return new AccountingDocumentHandler($entityManager->getRepository(AccountingDocument::class));
    }
}
