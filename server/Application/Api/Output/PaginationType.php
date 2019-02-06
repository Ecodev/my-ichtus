<?php

declare(strict_types=1);

namespace Application\Api\Output;

use Application\Model\Booking;
use GraphQL\Type\Definition\ObjectType;

class PaginationType extends ObjectType
{
    public function __construct(string $class, string $name)
    {
        $c = new \ReflectionClass($class);
        $s = $c->getShortName();
        $name = $s . 'Pagination';

        $config = [
            'name' => $name,
            'description' => 'Describe available pages',
            'fields' => function () use ($class): array {
                $fields = [
                    'offset' => [
                        'type' => self::nonNull(self::int()),
                        'description' => 'The zero-based index of the displayed list of items',
                    ],
                    'pageIndex' => [
                        'type' => self::nonNull(self::int()),
                        'description' => 'The zero-based page index of the displayed list of items',
                    ],
                    'pageSize' => [
                        'type' => self::nonNull(self::int()),
                        'description' => 'Number of items to display on a page',
                    ],
                    'length' => [
                        'type' => self::nonNull(self::int()),
                        'description' => 'The length of the total number of items that are being paginated',
                    ],
                    'items' => [
                        'type' => self::nonNull(self::listOf(self::nonNull(_types()->getOutput($class)))),
                        'description' => 'Paginated items',
                    ],
                ];

                // Add specific total fields if needed
                if ($class === Booking::class) {
                    $fields['totalParticipantCount'] = [
                        'type' => (self::int()),
                        'description' => 'The total count of participant',
                    ];
                    $fields['totalInitialPrice'] = [
                        'type' => (self::string()),
                        'description' => 'The total initial price',
                    ];
                    $fields['totalPeriodicPrice'] = [
                        'type' => (self::string()),
                        'description' => 'The total periodic price',
                    ];
                }

                return $fields;
            },
        ];

        parent::__construct($config);
    }
}
