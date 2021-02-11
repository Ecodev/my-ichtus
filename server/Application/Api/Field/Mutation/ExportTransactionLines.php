<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Field\Standard;
use Application\Model\TransactionLine;
use Application\Service\Exporter\TransactionLines;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class ExportTransactionLines implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'exportTransactionLines',
            'type' => Type::nonNull(Type::string()),
            'description' => 'Prepare an export of transactionLines and return the URL to download it',
            'args' => Standard::getListArguments(TransactionLine::class, false),
            'resolve' => function ($root, array $args, SessionInterface $session): string {
                global $container;

                /** @var TransactionLines $exporter */
                $exporter = $container->get(TransactionLines::class);

                $qb = Standard::createFilteredQueryBuilder(TransactionLine::class, $args);

                return $exporter->export($qb->getQuery()->getResult());
            },
        ];
    }
}
