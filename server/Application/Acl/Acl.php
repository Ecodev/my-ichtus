<?php

declare(strict_types=1);

namespace Application\Acl;

use Application\Acl\Assertion\BookableAvailable;
use Application\Acl\Assertion\BookingIsSelfApproved;
use Application\Acl\Assertion\ExpenseClaimStatusIsNew;
use Application\Acl\Assertion\IsFamily;
use Application\Acl\Assertion\StatusIsNew;
use Application\Model\Account;
use Application\Model\AccountingDocument;
use Application\Model\Bookable;
use Application\Model\BookableMetadata;
use Application\Model\BookableTag;
use Application\Model\Booking;
use Application\Model\Configuration;
use Application\Model\Country;
use Application\Model\ExpenseClaim;
use Application\Model\Image;
use Application\Model\License;
use Application\Model\Message;
use Application\Model\Transaction;
use Application\Model\TransactionTag;
use Application\Model\User;
use Application\Model\UserTag;
use Ecodev\Felix\Acl\Assertion\All;
use Ecodev\Felix\Acl\Assertion\IsMyself;
use Ecodev\Felix\Acl\Assertion\IsOwner;
use Ecodev\Felix\Acl\Assertion\One;

class Acl extends \Ecodev\Felix\Acl\Acl
{
    public function __construct()
    {
        // Each role is strictly "stronger" than the last one
        $this->addRole(User::ROLE_ANONYMOUS);
        $this->addRole(User::ROLE_BOOKING_ONLY, User::ROLE_ANONYMOUS);
        $this->addRole(User::ROLE_INDIVIDUAL, User::ROLE_BOOKING_ONLY);
        $this->addRole(User::ROLE_MEMBER, User::ROLE_INDIVIDUAL);
        $this->addRole(User::ROLE_TRAINER, User::ROLE_MEMBER);
        $this->addRole(User::ROLE_RESPONSIBLE, User::ROLE_TRAINER);
        $this->addRole(User::ROLE_ADMINISTRATOR, User::ROLE_RESPONSIBLE);

        $bookable = $this->createModelResource(Bookable::class);
        $bookableMetadata = $this->createModelResource(BookableMetadata::class);
        $bookableTag = $this->createModelResource(BookableTag::class);
        $booking = $this->createModelResource(Booking::class);
        $image = $this->createModelResource(Image::class);
        $license = $this->createModelResource(License::class);
        $user = $this->createModelResource(User::class);
        $userTag = $this->createModelResource(UserTag::class);
        $country = $this->createModelResource(Country::class);
        $account = $this->createModelResource(Account::class);
        $accountingDocument = $this->createModelResource(AccountingDocument::class);
        $transactionTag = $this->createModelResource(TransactionTag::class);
        $expenseClaim = $this->createModelResource(ExpenseClaim::class);
        $message = $this->createModelResource(Message::class);
        $transaction = $this->createModelResource(Transaction::class);
        $configuration = $this->createModelResource(Configuration::class);

        $this->allow(User::ROLE_ANONYMOUS, [$country, $bookable, $bookableMetadata, $bookableTag, $image, $license, $transactionTag, $configuration], ['read']);
        $this->allow(User::ROLE_BOOKING_ONLY, [$booking], ['create'], new BookableAvailable());
        $this->allow(User::ROLE_BOOKING_ONLY, [$booking], ['read']);
        $this->allow(User::ROLE_BOOKING_ONLY, [$booking], ['update'], new One(new BookingIsSelfApproved(), new isOwner()));

        $this->allow(User::ROLE_INDIVIDUAL, [$user], ['read']);
        $this->allow(User::ROLE_INDIVIDUAL, [$user], ['update'], new IsMyself());
        $this->allow(User::ROLE_INDIVIDUAL, [$expenseClaim], ['create']);
        $this->allow(User::ROLE_INDIVIDUAL, [$expenseClaim], ['read']);
        $this->allow(User::ROLE_INDIVIDUAL, [$expenseClaim], ['update', 'delete'], new All(new IsFamily(), new StatusIsNew()));
        $this->allow(User::ROLE_INDIVIDUAL, [$accountingDocument], ['create'], new ExpenseClaimStatusIsNew());
        $this->allow(User::ROLE_INDIVIDUAL, [$accountingDocument], ['read']);
        $this->allow(User::ROLE_INDIVIDUAL, [$accountingDocument], ['update', 'delete'], new All(new IsFamily(), new ExpenseClaimStatusIsNew()));
        $this->allow(User::ROLE_INDIVIDUAL, [$account], ['read']);
        $this->allow(User::ROLE_INDIVIDUAL, [$message], ['read']);

        $this->allow(User::ROLE_MEMBER, [$account], ['update']);
        $this->allow(User::ROLE_MEMBER, [$user], ['create']);
        $this->allow(User::ROLE_MEMBER, [$user], ['update'], new IsOwner());

        $this->allow(User::ROLE_RESPONSIBLE, [$transaction, $account, $transactionTag], ['read']);
        $this->allow(User::ROLE_RESPONSIBLE, [$expenseClaim, $accountingDocument], ['read', 'update']);
        $this->allow(User::ROLE_RESPONSIBLE, [$user], ['update']);
        $this->allow(User::ROLE_RESPONSIBLE, [$userTag], ['create', 'read', 'update', 'delete']);
        $this->allow(User::ROLE_RESPONSIBLE, [$bookable, $bookableMetadata, $bookableTag, $image, $license], ['create', 'update', 'delete']);
        $this->allow(User::ROLE_RESPONSIBLE, [$booking], ['update', 'delete']);

        $this->allow(User::ROLE_ADMINISTRATOR, [$transaction, $account, $transactionTag, $accountingDocument, $expenseClaim], ['create', 'update', 'delete']);
        $this->allow(User::ROLE_ADMINISTRATOR, [$configuration], ['create']);
    }
}
