<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Model\User;
use Application\Service\Accounting;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use PHPUnit\Framework\TestCase;

class AccountingTest extends TestCase
{
    use TestWithTransactionAndUser {
        setUp as setupWithTransaction;
    }

    private Accounting $accounting;

    protected function setUp(): void
    {
        $this->setupWithTransaction();

        /** @var User $user */
        $user = _em()->getRepository(User::class)->getOneByLogin('administrator');
        User::setCurrent($user);

        global $container;
        $this->accounting = $container->get(Accounting::class);
    }

    public function testCheck(): void
    {
        $this->expectOutputString(<<<STRING

            Produits  : 240.00
            Charges   : 112.50
            Bénéfice  : 127.50
            Actifs    : 35187.50
            Passifs   : 60.00
            Capital   : 35000.00
            Écart     : 0.00
            Création du compte 20300010 pour l'utilisateur 1003...
            Création du compte 20300011 pour l'utilisateur 1004...
            Création du compte 20300012 pour l'utilisateur 1005...
            Création du compte 20300013 pour l'utilisateur 1006...

            STRING
        );

        self::assertFalse($this->accounting->check(), 'fixture data should not produce any errors');
    }
}
