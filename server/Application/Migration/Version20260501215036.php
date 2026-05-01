<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20260501215036 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE indicator_definition (id INT AUTO_INCREMENT NOT NULL, creation_date DATETIME DEFAULT NULL, update_date DATETIME DEFAULT NULL, sorting INT DEFAULT 0 NOT NULL, name VARCHAR(191) NOT NULL, creator_id INT DEFAULT NULL, owner_id INT DEFAULT NULL, updater_id INT DEFAULT NULL, INDEX IDX_402D232761220EA6 (creator_id), INDEX IDX_402D23277E3C61F9 (owner_id), INDEX IDX_402D2327E37ECFB0 (updater_id), INDEX creation_date (creation_date), INDEX update_date (update_date), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE indicator_definition_addend (id INT AUTO_INCREMENT NOT NULL, creation_date DATETIME DEFAULT NULL, update_date DATETIME DEFAULT NULL, multiplier INT DEFAULT 100 NOT NULL, creator_id INT DEFAULT NULL, owner_id INT DEFAULT NULL, updater_id INT DEFAULT NULL, indicator_definition_id INT NOT NULL, account_id INT NOT NULL, INDEX IDX_857502A761220EA6 (creator_id), INDEX IDX_857502A77E3C61F9 (owner_id), INDEX IDX_857502A7E37ECFB0 (updater_id), INDEX IDX_857502A7A035BE01 (indicator_definition_id), INDEX IDX_857502A79B6B5FBA (account_id), INDEX creation_date (creation_date), INDEX update_date (update_date), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE indicator_definition_subtrahend (id INT AUTO_INCREMENT NOT NULL, creation_date DATETIME DEFAULT NULL, update_date DATETIME DEFAULT NULL, multiplier INT DEFAULT 100 NOT NULL, creator_id INT DEFAULT NULL, owner_id INT DEFAULT NULL, updater_id INT DEFAULT NULL, indicator_definition_id INT NOT NULL, account_id INT NOT NULL, INDEX IDX_1F1B311761220EA6 (creator_id), INDEX IDX_1F1B31177E3C61F9 (owner_id), INDEX IDX_1F1B3117E37ECFB0 (updater_id), INDEX IDX_1F1B3117A035BE01 (indicator_definition_id), INDEX IDX_1F1B31179B6B5FBA (account_id), INDEX creation_date (creation_date), INDEX update_date (update_date), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE indicator_definition ADD CONSTRAINT FK_402D232761220EA6 FOREIGN KEY (creator_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition ADD CONSTRAINT FK_402D23277E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition ADD CONSTRAINT FK_402D2327E37ECFB0 FOREIGN KEY (updater_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition_addend ADD CONSTRAINT FK_857502A761220EA6 FOREIGN KEY (creator_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition_addend ADD CONSTRAINT FK_857502A77E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition_addend ADD CONSTRAINT FK_857502A7E37ECFB0 FOREIGN KEY (updater_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition_addend ADD CONSTRAINT FK_857502A7A035BE01 FOREIGN KEY (indicator_definition_id) REFERENCES indicator_definition (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE indicator_definition_addend ADD CONSTRAINT FK_857502A79B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE indicator_definition_subtrahend ADD CONSTRAINT FK_1F1B311761220EA6 FOREIGN KEY (creator_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition_subtrahend ADD CONSTRAINT FK_1F1B31177E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition_subtrahend ADD CONSTRAINT FK_1F1B3117E37ECFB0 FOREIGN KEY (updater_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE indicator_definition_subtrahend ADD CONSTRAINT FK_1F1B3117A035BE01 FOREIGN KEY (indicator_definition_id) REFERENCES indicator_definition (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE indicator_definition_subtrahend ADD CONSTRAINT FK_1F1B31179B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
    }
}
