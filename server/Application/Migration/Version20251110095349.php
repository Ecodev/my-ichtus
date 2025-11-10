<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20251110095349 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
                ALTER TABLE message CHANGE type type ENUM('register', 'unregister', 'reset_password', 'balance', 'leave_family', 'admin_leave_family', 'request_user_deletion') NOT NULL
            SQL);
    }
}
