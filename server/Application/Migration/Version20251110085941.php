<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20251110085941 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
                ALTER TABLE expense_claim DROP FOREIGN KEY FK_461791D7E3C61F9
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE expense_claim CHANGE owner_id owner_id INT DEFAULT NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE expense_claim ADD CONSTRAINT FK_461791D7E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE SET NULL
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE log DROP FOREIGN KEY FK_8F3F68C561220EA6
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE log DROP FOREIGN KEY FK_8F3F68C57E3C61F9
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE log ADD CONSTRAINT FK_8F3F68C561220EA6 FOREIGN KEY (creator_id) REFERENCES user (id) ON DELETE CASCADE
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE log ADD CONSTRAINT FK_8F3F68C57E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE CASCADE
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F7E3C61F9
            SQL);
        $this->addSql(<<<'SQL'
                ALTER TABLE message ADD CONSTRAINT FK_B6BD307F7E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE CASCADE
            SQL);
    }
}
