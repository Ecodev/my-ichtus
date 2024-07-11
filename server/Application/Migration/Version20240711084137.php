<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20240711084137 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE log SET extra = '{}' WHERE extra = ''");
        $this->addSql('ALTER TABLE log CHANGE extra extra JSON DEFAULT \'{}\' NOT NULL COMMENT \'(DC2Type:json)\'');
    }
}
