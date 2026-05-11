<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20260508114201 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE account CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE bookable CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE bookable_metadata CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE bookable_tag CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE country CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE expense_claim CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE indicator_definition CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE license CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE log CHANGE request request LONGTEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE transaction CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE transaction_line CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE transaction_tag CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE user_tag CHANGE name name VARCHAR(191) DEFAULT \'\' NOT NULL');
    }
}
