<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20210518165931 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user CHANGE role role ENUM(\'booking_only\', \'individual\', \'accounting_verificator\', \'member\', \'trainer\', \'responsible\', \'administrator\') DEFAULT \'individual\' NOT NULL COMMENT \'(DC2Type:UserRole)\'');
    }
}
