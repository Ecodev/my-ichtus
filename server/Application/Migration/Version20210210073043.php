<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20210210073043 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // Mark all expenseClaims with transactions as processed
        $this->addSql("UPDATE expense_claim SET status = 'processed' WHERE status = 'new' AND id IN (SELECT expense_claim_id FROM transaction WHERE expense_claim_id IS NOT NULL)");
    }
}
