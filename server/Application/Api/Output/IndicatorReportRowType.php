<?php

declare(strict_types=1);

namespace Application\Api\Output;

use Application\Model\IndicatorDefinition;
use GraphQL\Type\Definition\ObjectType;

class IndicatorReportRowType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'description' => 'Accounting indicators report row',
            'fields' => [
                'value' => [
                    'type' => _types()->get('Money'),
                ],
                'budgetAllowed' => [
                    'type' => _types()->get('Money'),
                ],
                'budgetBalance' => [
                    'type' => _types()->get('Money'),
                ],
                'indicatorDefinition' => [
                    'type' => self::nonNull(_types()->getOutput(IndicatorDefinition::class)),
                ],
            ],
        ]);
    }
}
