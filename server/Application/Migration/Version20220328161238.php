<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20220328161238 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE bookable CHANGE purchase_price purchase_price INT UNSIGNED DEFAULT NULL COMMENT \'(DC2Type:Money)\'');
        $this->addSql('UPDATE bookable SET purchase_price = NULL WHERE purchase_price = 0');
    }
}
