<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20230919062617 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE account ADD total_balance_former INT DEFAULT 0 NOT NULL COMMENT \'(DC2Type:Money)\', CHANGE budget_balance budget_balance INT AS (IF(type = \'asset\' OR type = \'expense\', budget_allowed - (total_balance - total_balance_former), total_balance - budget_allowed)) PERSISTENT COMMENT \'(DC2Type:Money)\'');
    }
}
