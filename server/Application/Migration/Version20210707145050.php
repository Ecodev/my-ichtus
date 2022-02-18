<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20210707145050 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // Add new booking types to enum
        $this->addSql('ALTER TABLE bookable MODIFY booking_type ENUM(\'self_approved\', \'admin_approved\', \'application\', \'admin_assigned\', \'admin_only\', \'mandatory\') DEFAULT \'self_approved\' NOT NULL');
        // Migrate values of existing booking types
        $this->addSql('UPDATE bookable SET booking_type = \'application\' WHERE booking_type = \'admin_approved\'');
        $this->addSql('UPDATE bookable SET booking_type = \'admin_assigned\' WHERE booking_type = \'admin_only\'');
        // Remove old booking types from enum
        $this->addSql('ALTER TABLE bookable MODIFY booking_type ENUM(\'self_approved\', \'application\', \'admin_assigned\', \'mandatory\') DEFAULT \'self_approved\' NOT NULL COMMENT \'(DC2Type:BookingType)\'');
    }
}
