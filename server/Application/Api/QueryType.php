<?php

declare(strict_types=1);

namespace Application\Api;

use Application\Api\Field\Query\BankingInfos;
use Application\Api\Field\Query\Configuration;
use Application\Api\Field\Query\NextAccountCode;
use Application\Api\Field\Query\Permissions;
use Application\Api\Field\Query\UserByToken;
use Application\Api\Field\Query\UserLoginAvailable;
use Application\Api\Field\Query\UserRolesAvailable;
use Application\Api\Field\Query\Viewer;
use Application\Api\Field\Standard;
use Application\Model\Account;
use Application\Model\AccountingDocument;
use Application\Model\Bookable;
use Application\Model\BookableMetadata;
use Application\Model\BookableTag;
use Application\Model\Booking;
use Application\Model\Country;
use Application\Model\ExpenseClaim;
use Application\Model\Image;
use Application\Model\License;
use Application\Model\Log;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\TransactionTag;
use Application\Model\User;
use Application\Model\UserTag;
use GraphQL\Type\Definition\ObjectType;

class QueryType extends ObjectType
{
    public function __construct()
    {
        $specializedFields = [
            Viewer::build(),
            UserByToken::build(),
            Permissions::build(),
            BankingInfos::build(),
            UserLoginAvailable::build(),
            NextAccountCode::build(),
            Configuration::build(),
            UserRolesAvailable::build(),
        ];

        $fields = array_merge(
            $specializedFields,
            Standard::buildQuery(Bookable::class),
            Standard::buildQuery(BookableMetadata::class),
            Standard::buildQuery(BookableTag::class),
            Standard::buildQuery(Booking::class),
            Standard::buildQuery(Country::class),
            Standard::buildQuery(Image::class),
            Standard::buildQuery(License::class),
            Standard::buildQuery(User::class),
            Standard::buildQuery(UserTag::class),
            Standard::buildQuery(Account::class),
            Standard::buildQuery(Transaction::class),
            Standard::buildQuery(TransactionLine::class),
            Standard::buildQuery(TransactionTag::class),
            Standard::buildQuery(ExpenseClaim::class),
            Standard::buildQuery(AccountingDocument::class),
            Standard::buildQuery(Log::class),
        );

        $config = [
            'fields' => $fields,
        ];

        parent::__construct($config);
    }
}
