<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Ecodev\Felix\Migration\IrreversibleMigration;

class Version20190511044907 extends IrreversibleMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE bookable CHANGE code code VARCHAR(10) DEFAULT NULL');
        $this->addSql('UPDATE bookable SET code = NULL WHERE code = ""');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A10B812477153098 ON bookable (code)');
    }
}
