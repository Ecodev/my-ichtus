<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20200511114450 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE log CHANGE url url VARCHAR(2000) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE image CHANGE filename filename VARCHAR(190) DEFAULT \'\' NOT NULL, CHANGE mime mime VARCHAR(255) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE accounting_document CHANGE filename filename VARCHAR(190) DEFAULT \'\' NOT NULL, CHANGE mime mime VARCHAR(255) DEFAULT \'\' NOT NULL');
    }
}
