<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20221010191051 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX creation_date ON account (creation_date)');
        $this->addSql('CREATE INDEX update_date ON account (update_date)');
        $this->addSql('CREATE INDEX creation_date ON accounting_document (creation_date)');
        $this->addSql('CREATE INDEX update_date ON accounting_document (update_date)');
        $this->addSql('CREATE INDEX creation_date ON bookable (creation_date)');
        $this->addSql('CREATE INDEX update_date ON bookable (update_date)');
        $this->addSql('CREATE INDEX creation_date ON bookable_metadata (creation_date)');
        $this->addSql('CREATE INDEX update_date ON bookable_metadata (update_date)');
        $this->addSql('CREATE INDEX creation_date ON bookable_tag (creation_date)');
        $this->addSql('CREATE INDEX update_date ON bookable_tag (update_date)');
        $this->addSql('CREATE INDEX creation_date ON booking (creation_date)');
        $this->addSql('CREATE INDEX update_date ON booking (update_date)');
        $this->addSql('CREATE INDEX creation_date ON configuration (creation_date)');
        $this->addSql('CREATE INDEX update_date ON configuration (update_date)');
        $this->addSql('CREATE INDEX creation_date ON country (creation_date)');
        $this->addSql('CREATE INDEX update_date ON country (update_date)');
        $this->addSql('CREATE INDEX creation_date ON expense_claim (creation_date)');
        $this->addSql('CREATE INDEX update_date ON expense_claim (update_date)');
        $this->addSql('CREATE INDEX creation_date ON image (creation_date)');
        $this->addSql('CREATE INDEX update_date ON image (update_date)');
        $this->addSql('CREATE INDEX creation_date ON license (creation_date)');
        $this->addSql('CREATE INDEX update_date ON license (update_date)');
        $this->addSql('DROP INDEX priority ON log');
        $this->addSql('CREATE INDEX update_date ON log (update_date)');
        $this->addSql('CREATE INDEX priority ON log (priority)');
        $this->addSql('DROP INDEX date_created ON log');
        $this->addSql('CREATE INDEX creation_date ON log (creation_date)');
        $this->addSql('CREATE INDEX creation_date ON message (creation_date)');
        $this->addSql('CREATE INDEX update_date ON message (update_date)');
        $this->addSql('CREATE INDEX creation_date ON transaction (creation_date)');
        $this->addSql('CREATE INDEX update_date ON transaction (update_date)');
        $this->addSql('CREATE INDEX creation_date ON transaction_line (creation_date)');
        $this->addSql('CREATE INDEX update_date ON transaction_line (update_date)');
        $this->addSql('CREATE INDEX creation_date ON transaction_tag (creation_date)');
        $this->addSql('CREATE INDEX update_date ON transaction_tag (update_date)');
        $this->addSql('CREATE INDEX creation_date ON user (creation_date)');
        $this->addSql('CREATE INDEX update_date ON user (update_date)');
        $this->addSql('CREATE INDEX creation_date ON user_tag (creation_date)');
        $this->addSql('CREATE INDEX update_date ON user_tag (update_date)');
    }
}
