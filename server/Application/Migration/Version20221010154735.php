<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20221010154735 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // Delete all triggers, because they are a huge slow-down when updating each records. They will be recreated after migration
        $triggers = $this->connection->executeQuery('SHOW TRIGGERS;')->fetchFirstColumn();
        foreach ($triggers as $trigger) {
            $this->addSql("DROP TRIGGER `$trigger`");
        }

        $this->addSql('UPDATE `accounting_document` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `configuration` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `bookable_tag` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `transaction_line` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `user_tag` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `transaction` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `booking` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `bookable_metadata` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `country` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `license` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `log` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `bookable` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `transaction_tag` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `account` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `expense_claim` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `user` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `image` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
        $this->addSql('UPDATE `message` SET updater_id = creator_id, update_date = creation_date WHERE updater_id IS NULL AND update_date IS NULL;');
    }
}
