<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Api\Output\IndicatorReportRowType;
use Application\Model\IndicatorDefinition;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Api\Scalar\DateType;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class IndicatorReport implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'indicatorReport' => fn () => [
            'type' => Type::nonNull(Type::listOf(Type::nonNull(_types()->get(IndicatorReportRowType::class)))),
            'description' => 'Accounting indicators report',
            'args' => [
                'dateFrom' => [
                    'type' => Type::nonNull(_types()->get(DateType::class)),
                    'description' => 'Start date of the report period',
                ],
                'dateTo' => [
                    'type' => _types()->get(DateType::class),
                    'description' => 'End date of the report period',
                ],
            ],
            'resolve' => fn ($root, array $args, SessionInterface $session): array => _em()
                ->getRepository(IndicatorDefinition::class)
                ->getReport($args['dateFrom'], $args['dateTo']),
        ];
    }
}
