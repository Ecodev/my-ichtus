<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Model\IndicatorDefinition;
use Application\Service\Exporter\IndicatorReport;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Api\Scalar\DateType;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class ExportIndicatorReport implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'exportIndicatorReport' => fn () => [
            'type' => Type::nonNull(Type::string()),
            'description' => 'Prepare an accounting indicator report and return the URL to download it',
            'args' => [
                'dateFrom' => Type::nonNull(_types()->get(DateType::class)),
                'dateTo' => _types()->get(DateType::class),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): string {
                global $container;

                $config = $container->get('config');
                $exporter = new IndicatorReport($config['hostname']);
                $report = _em()->getRepository(IndicatorDefinition::class)->getReport($args['dateFrom'], $args['dateTo']);

                return $exporter->export($report);
            },
        ];
    }
}
