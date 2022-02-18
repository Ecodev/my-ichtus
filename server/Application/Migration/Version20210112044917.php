<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20210112044917 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE user SET iban = REPLACE(iban, " ", "")');
        $this->addSql('UPDATE account SET iban = REPLACE(iban, " ", "")');
    }
}
