<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20250423020434 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
                ALTER TABLE account CHANGE balance balance INT DEFAULT 0 NOT NULL, CHANGE type type ENUM('asset', 'liability', 'revenue', 'expense', 'equity', 'group') NOT NULL, CHANGE total_balance total_balance INT DEFAULT 0 NOT NULL, CHANGE budget_allowed budget_allowed INT DEFAULT NULL, CHANGE budget_balance budget_balance INT AS (IF(type = 'asset', budget_allowed - (total_balance - total_balance_former), budget_allowed - total_balance)) PERSISTENT, CHANGE total_balance_former total_balance_former INT DEFAULT 0 NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE bookable CHANGE initial_price initial_price INT DEFAULT 0 NOT NULL, CHANGE periodic_price periodic_price INT DEFAULT 0 NOT NULL, CHANGE purchase_price purchase_price INT UNSIGNED DEFAULT NULL, CHANGE booking_type booking_type ENUM('self_approved', 'application', 'admin_assigned', 'admin_approved', 'mandatory') DEFAULT 'admin_approved' NOT NULL, CHANGE state state ENUM('good', 'used', 'degraded') DEFAULT 'good' NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE booking CHANGE status status ENUM('application', 'booked', 'processed') DEFAULT 'application' NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE expense_claim CHANGE amount amount INT UNSIGNED NOT NULL, CHANGE status status ENUM('new', 'processing', 'processed', 'rejected') DEFAULT 'new' NOT NULL, CHANGE type type ENUM('expenseClaim', 'refund', 'invoice') DEFAULT 'expenseClaim' NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE log CHANGE extra extra JSON DEFAULT '{}' NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE message CHANGE type type ENUM('register', 'unregister', 'reset_password', 'balance', 'leave_family', 'admin_leave_family') NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE transaction CHANGE balance balance INT UNSIGNED DEFAULT 0 NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE transaction_line CHANGE balance balance INT UNSIGNED NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE user CHANGE role role ENUM('booking_only', 'individual', 'accounting_verificator', 'member', 'trainer', 'formation_responsible', 'responsible', 'administrator') DEFAULT 'individual' NOT NULL, CHANGE status status ENUM('inactive', 'new', 'active', 'archived') DEFAULT 'new' NOT NULL, CHANGE swiss_sailing_type swiss_sailing_type ENUM('active', 'passive', 'junior') DEFAULT NULL, CHANGE swiss_windsurf_type swiss_windsurf_type ENUM('active', 'passive') DEFAULT NULL, CHANGE family_relationship family_relationship ENUM('householder', 'partner', 'child', 'parent', 'sister', 'brother') DEFAULT 'householder' NOT NULL, CHANGE billing_type billing_type ENUM('electronic', 'paper') DEFAULT 'electronic' NOT NULL
            SQL);
    }
}
