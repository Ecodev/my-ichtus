<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20230831100857 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE account ADD budget_allowed INT DEFAULT NULL COMMENT \'(DC2Type:Money)\', ADD budget_balance INT AS (budget_allowed - total_balance) PERSISTENT COMMENT \'(DC2Type:Money)\'');
    }
}
