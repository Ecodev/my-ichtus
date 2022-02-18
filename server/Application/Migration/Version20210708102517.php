<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20210708102517 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // New booking type for courses
        $this->addSql('ALTER TABLE bookable MODIFY booking_type ENUM(\'self_approved\', \'application\', \'admin_assigned\', \'admin_approved\', \'mandatory\') DEFAULT \'self_approved\' NOT NULL COMMENT \'(DC2Type:BookingType)\'');
    }
}
