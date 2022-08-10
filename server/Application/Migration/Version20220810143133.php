<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20220810143133 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE message CHANGE type type ENUM(\'register\', \'unregister\', \'reset_password\', \'balance\', \'leave_family\', \'admin_leave_family\') NOT NULL COMMENT \'(DC2Type:MessageType)\'');
    }
}
