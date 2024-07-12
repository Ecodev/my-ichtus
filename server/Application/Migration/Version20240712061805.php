<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20240712061805 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user CHANGE status status ENUM(\'inactive\', \'new\', \'active\', \'archived\') DEFAULT \'new\' NOT NULL COMMENT \'(FelixEnum:3f4e6378c43078a899c297c8469c22cf)(DC2Type:UserStatus)\'');
    }
}
