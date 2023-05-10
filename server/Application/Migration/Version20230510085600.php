<?php

declare(strict_types=1);

namespace Application\Migration;

use Application\Repository\BookableTagRepository;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20230510085600 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE bookable ADD waiting_list_length SMALLINT UNSIGNED DEFAULT 0 NOT NULL');
        $this->addSql(
            <<<SQL
                UPDATE bookable
                INNER JOIN bookable_tag_bookable ON bookable.id = bookable_tag_bookable.bookable_id AND bookable_tag_bookable.bookable_tag_id IN (?, ?)
                SET waiting_list_length = 5
                SQL,
            [
                BookableTagRepository::WELCOME_ID,
                BookableTagRepository::FORMATION_ID,
            ]
        );
    }
}
