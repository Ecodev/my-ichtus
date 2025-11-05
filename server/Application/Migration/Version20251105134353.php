<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20251105134353 extends AbstractMigration
{
    public function up(Schema $schema): void
    {

        // user.id => bookable_tag.id
        $map = [
            '11055' => '6004',
            '11056' => '6003',
            '11057' => '6001',
            '11058' => '6000',
            '11059' => '6005',
            '11060' => '6006',
            '11061' => '6043',
            '11062' => '6038',
        ];

        foreach ($map as $userId => $bookableTagId) {
            $this->addSql(
                "UPDATE bookable
                INNER JOIN bookable_tag_bookable btb ON bookable.id = btb.bookable_id
                SET bookable.owner_id = {$userId}
                WHERE btb.bookable_tag_id = {$bookableTagId}",
            );
        }

    }
}
