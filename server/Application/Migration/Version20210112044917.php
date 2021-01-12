<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Ecodev\Felix\Migration\IrreversibleMigration;

class Version20210112044917 extends IrreversibleMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE user SET iban = REPLACE(iban, " ", "")');
        $this->addSql('UPDATE account SET iban = REPLACE(iban, " ", "")');
    }
}
