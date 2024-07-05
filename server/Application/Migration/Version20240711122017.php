<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20240711122017 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE bookable CHANGE description description TEXT DEFAULT \'\' NOT NULL, CHANGE remarks remarks TEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE booking CHANGE remarks remarks TEXT DEFAULT \'\' NOT NULL, CHANGE internal_remarks internal_remarks TEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE configuration CHANGE description description TEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE expense_claim CHANGE description description TEXT DEFAULT \'\' NOT NULL, CHANGE remarks remarks TEXT DEFAULT \'\' NOT NULL, CHANGE internal_remarks internal_remarks TEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE log CHANGE referer referer VARCHAR(500) DEFAULT \'\' NOT NULL, CHANGE request request VARCHAR(1000) DEFAULT \'\' NOT NULL, CHANGE ip ip VARCHAR(40) DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE transaction CHANGE remarks remarks TEXT DEFAULT \'\' NOT NULL, CHANGE internal_remarks internal_remarks TEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE transaction_line CHANGE remarks remarks TEXT DEFAULT \'\' NOT NULL');
        $this->addSql('ALTER TABLE user CHANGE password password VARCHAR(255) DEFAULT \'\' NOT NULL, CHANGE remarks remarks TEXT DEFAULT \'\' NOT NULL, CHANGE internal_remarks internal_remarks TEXT DEFAULT \'\' NOT NULL, CHANGE street street VARCHAR(255) DEFAULT \'\' NOT NULL, CHANGE postcode postcode VARCHAR(20) DEFAULT \'\' NOT NULL, CHANGE locality locality VARCHAR(255) DEFAULT \'\' NOT NULL');
    }
}
