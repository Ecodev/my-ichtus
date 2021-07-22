<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Ecodev\Felix\Migration\IrreversibleMigration;

class Version20210722060624 extends IrreversibleMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_33578A57ABDEDCD ON transaction_line');
        $this->addSql('CREATE UNIQUE INDEX unique_import ON transaction_line (transaction_date, imported_id)');
    }
}
