<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Ecodev\Felix\Migration\IrreversibleMigration;

class Version20210708102517 extends IrreversibleMigration
{
    public function up(Schema $schema): void
    {
        // New booking type for courses
        $this->addSql('ALTER TABLE bookable MODIFY booking_type ENUM(\'self_approved\', \'application\', \'admin_assigned\', \'admin_approved\', \'mandatory\') DEFAULT \'self_approved\' NOT NULL COMMENT \'(DC2Type:BookingType)\'');
    }
}
