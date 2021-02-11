<?php

declare(strict_types=1);

namespace Application\Api\Output;

use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\TransactionLine;
use GraphQL\Type\Definition\Type;

/**
 * Create a Pagination type for the entity extracted from name.
 *
 * For example, if given "ActionPagination", it will create a Pagination
 * type for the Action entity.
 */
class PaginationTypeFactory extends \Ecodev\Felix\Api\Output\PaginationTypeFactory
{
    protected function getExtraFields(string $class): array
    {
        $fields = [];

        // Add specific total fields if needed
        if ($class === Booking::class) {
            $fields['totalParticipantCount'] = [
                'type' => Type::int(),
                'description' => 'The total count of participant',
            ];
            $fields['totalInitialPrice'] = [
                'type' => _types()->get('Money'),
                'description' => 'The total initial price',
            ];
            $fields['totalPeriodicPrice'] = [
                'type' => _types()->get('Money'),
                'description' => 'The total periodic price',
            ];
        } elseif ($class === Bookable::class) {
            $fields['totalPurchasePrice'] = [
                'type' => _types()->get('Money'),
                'description' => 'The total purchase price',
            ];
            $fields['totalInitialPrice'] = [
                'type' => _types()->get('Money'),
                'description' => 'The total initial price',
            ];
            $fields['totalPeriodicPrice'] = [
                'type' => _types()->get('Money'),
                'description' => 'The total periodic price',
            ];
        } elseif ($class === TransactionLine::class) {
            $fields['totalBalance'] = [
                'type' => _types()->get('Money'),
                'description' => 'The total balance',
            ];
        }

        return $fields;
    }
}
