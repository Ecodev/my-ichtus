<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20210407073316 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE user SET owner_id = NULL WHERE owner_id = id');
    }
}
