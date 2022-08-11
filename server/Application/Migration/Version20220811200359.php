<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20220811200359 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE bookable CHANGE booking_type booking_type ENUM(\'self_approved\', \'application\', \'admin_assigned\', \'admin_approved\', \'mandatory\') DEFAULT \'admin_approved\' NOT NULL COMMENT \'(DC2Type:BookingType)\'');
    }
}
