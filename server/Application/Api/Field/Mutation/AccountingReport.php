<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Handler\ExportAccountingReportHandler;
use Application\Model\Account;
use Application\Repository\AccountRepository;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class AccountingReport implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'accountingReport',
            'type' => Type::string(),
            'description' => 'Prepare an accounting report and return the URL to download it',
            'args' => [
                'date' => _types()->get('Date'),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): string {
                global $container;

                /** @var ExportAccountingReportHandler $exporter */
                $exporter = $container->get(ExportAccountingReportHandler::class);

                if ($args['date']) {
                    $exporter->setDate($args['date']);
                }

                // Select root accounts
                /** @var AccountRepository $accountRepository */
                $accountRepository = _em()->getRepository(Account::class);
                $rootAccountsQuery = $accountRepository->getRootAccountsQuery();

                return $exporter->generate($rootAccountsQuery);
            },
        ];
    }
}
