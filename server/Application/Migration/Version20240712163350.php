<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20240712163350 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE account MODIFY COLUMN budget_balance INT AS (IF(type = \'asset\', budget_allowed - (total_balance - total_balance_former), budget_allowed - total_balance)) PERSISTENT COMMENT \'(DC2Type:Money)\'');
    }
}
