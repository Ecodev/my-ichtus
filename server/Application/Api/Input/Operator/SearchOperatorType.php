<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\Booking;
use Doctrine\ORM\Mapping\ClassMetadata;

class SearchOperatorType extends \Ecodev\Felix\Api\Input\Operator\SearchOperatorType
{
    protected function getSearchableFieldsWhitelist(ClassMetadata $metadata): array
    {
        $whitelistedFields = [
            'firstName',
            'lastName',
            'name',
            'locality',
            'email',
            'destination',
            'startComment',
            'endComment',
            'code',
            'message',
            'login',
        ];

        if ($metadata->name === Bookable::class) {
            $whitelistedFields[] = 'description';
        }

        return $whitelistedFields;
    }

    protected function getSearchableJoinedEntities(): array
    {
        return [
            Booking::class => ['owner', 'bookable'],
        ];
    }
}
