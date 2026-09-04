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
                    'type' => _types()->get(DateType::class),
                    'description' => 'Start of the period. Without it, indicators show the state of their accounts at the end date, including everything that happened before',
                ],
                'dateTo' => [
                    'type' => _types()->get(DateType::class),
                    'description' => 'End of the period. Without it, indicators show the state of their accounts as it is right now',
                ],
            ],
            'resolve' => fn ($root, array $args, SessionInterface $session): array => _em()
                ->getRepository(IndicatorDefinition::class)
                ->getReport($args['dateFrom'] ?? null, $args['dateTo'] ?? null),
        ];
    }
}
