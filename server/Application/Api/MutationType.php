<?php

declare(strict_types=1);

namespace Application\Api;

use Application\Api\Field\Mutation\AccountingClosing;
use Application\Api\Field\Mutation\ConfirmRegistration;
use Application\Api\Field\Mutation\CreateTransaction;
use Application\Api\Field\Mutation\ExportAccountingReport;
use Application\Api\Field\Mutation\ExportTransactionLines;
use Application\Api\Field\Mutation\ImportCamt;
use Application\Api\Field\Mutation\LeaveFamily;
use Application\Api\Field\Mutation\Login;
use Application\Api\Field\Mutation\Logout;
use Application\Api\Field\Mutation\OpenDoor;
use Application\Api\Field\Mutation\ReconcileTransactionLine;
use Application\Api\Field\Mutation\Register;
use Application\Api\Field\Mutation\RequestPasswordReset;
use Application\Api\Field\Mutation\TerminateBooking;
use Application\Api\Field\Mutation\Unregister;
use Application\Api\Field\Mutation\UpdateConfiguration;
use Application\Api\Field\Mutation\UpdatePassword;
use Application\Api\Field\Mutation\UpdateTransaction;
use Application\Api\Field\Standard;
use Application\Model\Account;
use Application\Model\AccountingDocument;
use Application\Model\Bookable;
use Application\Model\BookableMetadata;
use Application\Model\BookableTag;
use Application\Model\Booking;
use Application\Model\ExpenseClaim;
use Application\Model\Image;
use Application\Model\License;
use Application\Model\Transaction;
use Application\Model\TransactionTag;
use Application\Model\User;
use Application\Model\UserTag;
use Ecodev\Felix\Utility;
use GraphQL\Type\Definition\ObjectType;

class MutationType extends ObjectType
{
    public function __construct()
    {
        $fields = Utility::concat(
            // Specialized fields
            Login::build(),
            Logout::build(),
            OpenDoor::build(),
            TerminateBooking::build(),
            RequestPasswordReset::build(),
            UpdatePassword::build(),
            Register::build(),
            ConfirmRegistration::build(),
            Unregister::build(),
            LeaveFamily::build(),
            CreateTransaction::build(),
            UpdateTransaction::build(),
            ReconcileTransactionLine::build(),
            ImportCamt::build(),
            Utility::filterByKeys(Standard::buildMutation(Transaction::class), 'deleteTransactions'),
            UpdateConfiguration::build(),
            AccountingClosing::build(),
            ExportAccountingReport::build(),
            ExportTransactionLines::build(),

            // Standard fields
            Standard::buildMutation(Bookable::class),
            Standard::buildMutation(BookableMetadata::class),
            Standard::buildMutation(BookableTag::class),
            Standard::buildMutation(Booking::class),
            Standard::buildMutation(Image::class),
            Standard::buildMutation(License::class),
            Standard::buildMutation(User::class),
            Standard::buildMutation(UserTag::class),
            Standard::buildMutation(Account::class),
            Standard::buildMutation(TransactionTag::class),
            Standard::buildMutation(ExpenseClaim::class),
            Standard::buildMutation(AccountingDocument::class),
            Standard::buildRelationMutation(License::class, Bookable::class),
            Standard::buildRelationMutation(License::class, User::class),
            Standard::buildRelationMutation(UserTag::class, User::class),
            Standard::buildRelationMutation(BookableTag::class, Bookable::class),
            Standard::buildRelationMutation(Account::class, Account::class, 'Parent')
        );

        $config = [
            'fields' => $fields,
        ];

        parent::__construct($config);
    }
}
