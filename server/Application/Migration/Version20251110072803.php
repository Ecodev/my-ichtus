<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20251110072803 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            <<<SQL
                UPDATE transaction_line
                INNER JOIN transaction ON transaction_line.transaction_id = transaction.id
                INNER JOIN expense_claim ON transaction.expense_claim_id = expense_claim.id
                SET transaction_line.remarks = REGEXP_REPLACE(CONCAT(transaction_line.remarks, '\n\n', expense_claim.description), '^[[:space:]]+', '')
                SQL
        );
    }
}
