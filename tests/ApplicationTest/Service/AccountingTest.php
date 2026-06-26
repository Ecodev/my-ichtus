<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Enum\AccountType;
use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Service\Accounting;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Cake\Chronos\Chronos;
use Cake\Chronos\ChronosDate;
use Money\Money;
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

        $this->setCurrentUser('administrator');

        global $container;
        $this->accounting = $container->get(Accounting::class);
    }

    public function testCheck(): void
    {
        $this->expectOutputString(
            <<<STRING

                Produits       : 240.00 CHF
                Charges        : 112.50 CHF
                Bénéfice       : 127.50 CHF
                Actifs         : 35187.50 CHF
                Passifs        : 35060.00 CHF
                Résultat       : 0.00 CHF
                Écart          : 0.00 CHF
                Création du compte 20300010 pour l'utilisateur 1003...
                Création du compte 20300011 pour l'utilisateur 1004...
                Création du compte 20300012 pour l'utilisateur 1005...
                Création du compte 20300013 pour l'utilisateur 1006...
                Création du compte 20300014 pour l'utilisateur 1014...
                Création du compte 20300015 pour l'utilisateur 1015...
                1 compte(s) orphelin(s) ont été effacé(s)
                1 compte(s) de famille consolidé(s)

                STRING
        );

        self::assertFalse($this->accounting->check(), 'deleting useless accounts and consolidating family accounts should not be reported as errors');
    }

    public function testCheckFamilyMembersShareSameAccount(): void
    {
        // Unrelated to this test, and would otherwise also print its own message
        _em()->getConnection()->executeStatement('DELETE FROM account WHERE id = 10109');

        /** @var AccountRepository $accountRepository */
        $accountRepository = _em()->getRepository(Account::class);

        $childAccount = $accountRepository->getOneById(10108); // Conj Oint, owned by user 1007, partner of family owner 1002
        $ownerAccount = $accountRepository->getOneById(10096); // Active Member, owned by family owner 1002

        self::assertTrue(Money::CHF(-5000)->equals($childAccount->getBalance()), 'fixture should give the family member account a debt of 50 CHF');
        self::assertNotNull($childAccount->getOwner());

        $ownerBalanceBefore = $ownerAccount->getBalance();

        ob_start();
        $hasError = $this->accounting->check();
        $output = (string) ob_get_clean();

        self::assertFalse($hasError, 'a successful automatic regularization should not be reported as an error');
        self::assertStringContainsString('1 compte(s) de famille consolidé(s)', $output);

        _em()->refresh($childAccount);
        _em()->refresh($ownerAccount);

        self::assertTrue(Money::CHF(0)->equals($childAccount->getBalance()), 'the family member account balance should have been fully transferred');
        self::assertNull($childAccount->getOwner(), 'the family member account should be detached once regularized');
        self::assertTrue($ownerBalanceBefore->subtract(Money::CHF(5000))->equals($ownerAccount->getBalance()), 'the owner balance should be reduced by the negative balance that was absorbed');

        /** @var User $childUser */
        $childUser = _em()->getRepository(User::class)->getOneById(1007);
        /** @var User $parentUser */
        $parentUser = _em()->getRepository(User::class)->getOneById(1002);

        self::assertSame(
            'Consolidation automatique des comptes du ménage : a transféré -50.00 CHF à Active Member',
            $childUser->getInternalRemarks(),
        );
        self::assertSame(
            'Consolidation automatique des comptes du ménage : a reçu -50.00 CHF de Conj Oint',
            $parentUser->getInternalRemarks(),
        );
    }

    public function testCheckUselessAccounts(): void
    {
        /** @var AccountRepository $accountRepository */
        $accountRepository = _em()->getRepository(Account::class);

        $orphanAccount = $accountRepository->getOneById(10109); // Compte orphelin de test, no owner, no transaction
        self::assertNull($orphanAccount->getOwner());

        ob_start();
        $hasError = $this->accounting->check();
        ob_end_clean();

        self::assertFalse($hasError, 'deleting a useless account should not be reported as an error');

        $exists = _em()->getConnection()->fetchOne('SELECT COUNT(*) FROM account WHERE id = 10109');
        self::assertSame(0, (int) $exists, 'the orphan account should have been deleted');
    }

    public function testClose(): void
    {
        /** @var AccountRepository $accountRepository */
        $accountRepository = _em()->getRepository(Account::class);
        $closingDate = ChronosDate::create(2019, 12, 31);

        $expectedLog = [
            'Bouclement au 31.12.2019',
            'Bénéfice : 127.50',
        ];
        $output = [];
        $closingTransaction = $this->accounting->close($closingDate, $output);
        self::assertSame($expectedLog, $output);

        self::assertNotNull($closingTransaction);
        $actualDate = $closingTransaction->getTransactionDate();
        $expectedDateTime = new Chronos('2020-01-01 00:00:00');
        self::assertTrue($actualDate->equals($expectedDateTime), 'Closing transaction was not created on ' . $closingDate);

        $accounts = $accountRepository->findByType([AccountType::Revenue, AccountType::Expense]);
        $openingDate = $closingDate->addDays(1);
        foreach ($accounts as $account) {
            self::assertTrue(Money::CHF(0)->equals($account->getBalanceAtDate($openingDate)));
        }

        $this->expectExceptionMessage('Le bouclement a déjà été fait au 2019-12-31');
        $this->accounting->close($closingDate, $output);
    }
}
