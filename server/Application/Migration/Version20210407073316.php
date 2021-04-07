<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Ecodev\Felix\Migration\IrreversibleMigration;

class Version20210407073316 extends IrreversibleMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE user SET owner_id = NULL WHERE owner_id = id');
    }
}
