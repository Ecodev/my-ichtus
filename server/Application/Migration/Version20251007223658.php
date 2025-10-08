<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20251007223658 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
                ALTER TABLE bookable ADD status ENUM('new', 'active', 'inactive', 'archived') DEFAULT 'new' NOT NULL
            SQL);

        $this->addSql(<<<'SQL'
                UPDATE bookable SET status = IF(is_active = 1, 'active', 'inactive')
            SQL);

        $this->addSql(<<<'SQL'
                ALTER TABLE bookable DROP is_active
            SQL);

    }
}
