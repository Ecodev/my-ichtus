<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20190513041833 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE account SET balance = 100 * balance');
        $this->addSql('UPDATE transaction_line SET balance = 100 * balance');
        $this->addSql('UPDATE expense_claim SET amount = 100 * amount');
        $this->addSql('UPDATE bookable SET initial_price = 100 * initial_price, periodic_price = 100 * periodic_price, purchase_price = 100 * purchase_price;');

        $this->addSql('ALTER TABLE account CHANGE balance balance INT DEFAULT 0 NOT NULL COMMENT \'(DC2Type:Money)\'');
        $this->addSql('ALTER TABLE transaction_line CHANGE balance balance INT UNSIGNED NOT NULL COMMENT \'(DC2Type:Money)\'');
        $this->addSql('ALTER TABLE expense_claim CHANGE amount amount INT UNSIGNED NOT NULL COMMENT \'(DC2Type:Money)\'');
        $this->addSql('ALTER TABLE bookable CHANGE initial_price initial_price INT DEFAULT 0 NOT NULL COMMENT \'(DC2Type:Money)\', CHANGE periodic_price periodic_price INT DEFAULT 0 NOT NULL COMMENT \'(DC2Type:Money)\', CHANGE purchase_price purchase_price INT UNSIGNED DEFAULT 0 NOT NULL COMMENT \'(DC2Type:Money)\';');
    }
}
