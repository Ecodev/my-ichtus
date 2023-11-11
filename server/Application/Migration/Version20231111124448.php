<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20231111124448 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE account CHANGE type type ENUM(\'asset\', \'liability\', \'revenue\', \'expense\', \'equity\', \'group\') NOT NULL COMMENT \'(FelixEnum:3eadc8ab9c4521335dc5eaec4a626db3)(DC2Type:AccountType)\'');
        $this->addSql('ALTER TABLE bookable CHANGE booking_type booking_type ENUM(\'self_approved\', \'application\', \'admin_assigned\', \'admin_approved\', \'mandatory\') DEFAULT \'admin_approved\' NOT NULL COMMENT \'(FelixEnum:830ea26afb1a4726937dea17ef3ba023)(DC2Type:BookingType)\', CHANGE state state ENUM(\'good\', \'used\', \'degraded\') DEFAULT \'good\' NOT NULL COMMENT \'(FelixEnum:7e9cd3def74555b25b55fe67a2e2db75)(DC2Type:BookableState)\'');
        $this->addSql('ALTER TABLE booking CHANGE status status ENUM(\'application\', \'booked\', \'processed\') DEFAULT \'application\' NOT NULL COMMENT \'(FelixEnum:acb89b7d13309a82090cd035642f2168)(DC2Type:BookingStatus)\'');
        $this->addSql('ALTER TABLE expense_claim CHANGE status status ENUM(\'new\', \'processing\', \'processed\', \'rejected\') DEFAULT \'new\' NOT NULL COMMENT \'(FelixEnum:50c135b6e5ddaae8a37b65e0642cb044)(DC2Type:ExpenseClaimStatus)\', CHANGE type type ENUM(\'expenseClaim\', \'refund\', \'invoice\') DEFAULT \'expenseClaim\' NOT NULL COMMENT \'(FelixEnum:34901535ff050c6532732c913aac0bd4)(DC2Type:ExpenseClaimType)\'');
        $this->addSql('ALTER TABLE message CHANGE type type ENUM(\'register\', \'unregister\', \'reset_password\', \'balance\', \'leave_family\', \'admin_leave_family\') NOT NULL COMMENT \'(FelixEnum:293512ebee2033fab1965e98f350c476)(DC2Type:MessageType)\'');
        $this->addSql('ALTER TABLE user CHANGE role role ENUM(\'booking_only\', \'individual\', \'accounting_verificator\', \'member\', \'trainer\', \'formation_responsible\', \'responsible\', \'administrator\') DEFAULT \'individual\' NOT NULL COMMENT \'(FelixEnum:6354c07dc33eaa19bba3c027d014221e)(DC2Type:UserRole)\', CHANGE status status ENUM(\'inactive\', \'active\', \'new\', \'archived\') DEFAULT \'new\' NOT NULL COMMENT \'(FelixEnum:2076311458be951352e82ea6db6c103b)(DC2Type:UserStatus)\', CHANGE swiss_sailing_type swiss_sailing_type ENUM(\'active\', \'passive\', \'junior\') DEFAULT NULL COMMENT \'(FelixEnum:42a8dd5102d3a4a5226f111bb16b66ba)(DC2Type:SwissSailingType)\', CHANGE swiss_windsurf_type swiss_windsurf_type ENUM(\'active\', \'passive\') DEFAULT NULL COMMENT \'(FelixEnum:f8f8347c4cb3a8f19828abb692b4fcf2)(DC2Type:SwissWindsurfType)\', CHANGE family_relationship family_relationship ENUM(\'householder\', \'partner\', \'child\', \'parent\', \'sister\', \'brother\') DEFAULT \'householder\' NOT NULL COMMENT \'(FelixEnum:2bb16f90424159915963f0524c6ff657)(DC2Type:Relationship)\', CHANGE billing_type billing_type ENUM(\'electronic\', \'paper\') DEFAULT \'electronic\' NOT NULL COMMENT \'(FelixEnum:55765ada5bf06091eb09483d2e4da4ce)(DC2Type:BillingType)\'');
    }
}
