<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20260903100000 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE transaction ADD is_closing TINYINT DEFAULT 0 NOT NULL');
        $this->addSql("UPDATE transaction SET is_closing = 1 WHERE name LIKE 'Bouclement%' AND internal_remarks = 'Écriture générée automatiquement'");
    }
}
