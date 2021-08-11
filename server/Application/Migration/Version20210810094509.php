<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Ecodev\Felix\Migration\IrreversibleMigration;

class Version20210810094509 extends IrreversibleMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE expense_claim ADD reviewer_id INT DEFAULT NULL AFTER `updater_id`');
        $this->addSql('ALTER TABLE expense_claim ADD CONSTRAINT FK_461791D70574616 FOREIGN KEY (reviewer_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_461791D70574616 ON expense_claim (reviewer_id)');
        $this->addSql('ALTER TABLE expense_claim CHANGE `type` `type` ENUM(\'expenseClaim\', \'refund\', \'invoice\') DEFAULT \'expenseClaim\' NOT NULL COMMENT \'(DC2Type:ExpenseClaimType)\'');
    }
}
