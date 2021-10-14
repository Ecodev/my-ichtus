<?php

declare(strict_types=1);

namespace Application\Api\Input\Operator;

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

        return $whitelistedFields;
    }

    protected function getSearchableJoinedEntities(): array
    {
        return [
            Booking::class => ['owner', 'bookable'],
        ];
    }
}
