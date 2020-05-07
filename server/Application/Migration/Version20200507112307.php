<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;

class Version20200507112307 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE transaction t SET t.balance=(SELECT SUM(balance) from transaction_line tl WHERE tl.transaction_id=t.id) WHERE t.balance IS NULL');
        $this->addSql('ALTER TABLE transaction CHANGE balance balance INT UNSIGNED DEFAULT 0 NOT NULL COMMENT \'(DC2Type:Money)\'');
    }
}
