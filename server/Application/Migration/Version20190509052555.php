<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;

class Version20190509052555 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE transaction_line ADD imported_id VARCHAR(35) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_33578A57ABDEDCD ON transaction_line (imported_id)');
    }
}
