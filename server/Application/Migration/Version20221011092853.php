<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20221011092853 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user ADD first_login DATETIME DEFAULT NULL, ADD last_login DATETIME DEFAULT NULL');

        // Migrate first/last login from log to user
        $this->addSql(
            <<<STRING
                UPDATE user INNER JOIN (
                    SELECT creator_id, MIN(creation_date) AS min, MAX(creation_date) AS max
                    FROM log
                    WHERE creator_id IS NOT NULL AND message = 'login'
                    GROUP BY creator_id
                ) AS tmp ON tmp.creator_id = user.id
                SET user.first_login = IFNULL(user.first_login, tmp.min), user.last_login = tmp.max;
                STRING
        );

        // Delete old login logs
        $this->addSql("DELETE FROM log WHERE message = 'login' AND creation_date < DATE_SUB(NOW(), INTERVAL 2 MONTH)");
    }
}
