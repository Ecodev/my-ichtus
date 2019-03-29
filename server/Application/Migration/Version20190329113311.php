<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;

class Version20190329113311 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user CHANGE billing_type billing_type ENUM(\'all_electronic\', \'paper_bill_electronic_reminder\', \'paper_bill_paper_reminder\', \'electronic\', \'paper\') DEFAULT \'electronic\' NOT NULL COMMENT \'(DC2Type:BillingType)\'');
        $this->addSql('UPDATE user SET billing_type=\'electronic\' WHERE billing_type = \'all_electronic\'');
        $this->addSql('ALTER TABLE user CHANGE billing_type billing_type ENUM(\'electronic\', \'paper\') DEFAULT \'electronic\' NOT NULL COMMENT \'(DC2Type:BillingType)\'');
    }
}
