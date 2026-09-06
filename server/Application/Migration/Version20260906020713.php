<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20260906020713 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX balance_by_debit ON transaction_line (debit_id, transaction_date, balance)');
        $this->addSql('CREATE INDEX balance_by_credit ON transaction_line (credit_id, transaction_date, balance)');
    }
}
