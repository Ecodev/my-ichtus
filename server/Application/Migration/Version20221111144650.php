<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20221111144650 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE booking CHANGE start_comment start_comment TEXT DEFAULT \'\' NOT NULL, CHANGE end_comment end_comment TEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE message CHANGE body body TEXT DEFAULT \'\' NOT NULL');
    }
}
