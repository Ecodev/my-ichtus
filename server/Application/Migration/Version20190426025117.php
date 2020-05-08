<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Ecodev\Felix\Migration\IrreversibleMigration;

class Version20190426025117 extends IrreversibleMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE transaction ADD transaction_date DATETIME NOT NULL');
        $this->addSql('UPDATE transaction SET transaction_date = transactionDate');
        $this->addSql('ALTER TABLE transaction DROP transactionDate');

        $this->addSql('ALTER TABLE transaction_line ADD transaction_date DATETIME NOT NULL');
        $this->addSql('UPDATE transaction_line SET transaction_date = transactionDate');
        $this->addSql('ALTER TABLE transaction_line DROP transactionDate');
    }
}
