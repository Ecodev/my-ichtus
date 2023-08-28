<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
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
                Création du compte 20300014 pour l'utilisateur 1014...
                Création du compte 20300015 pour l'utilisateur 1015...

                STRING
        );

        self::assertFalse($this->accounting->check(), 'fixture data should not produce any errors');
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

        $actualDate = $closingTransaction->getTransactionDate();
        $expectedDateTime = new Chronos('2020-01-01 00:00:00');
        self::assertTrue($actualDate->equals($expectedDateTime), 'Closing transaction was not created on ' . $closingDate);

        $accounts = $accountRepository->findByType([AccountTypeType::REVENUE, AccountTypeType::EXPENSE]);
        $openingDate = $closingDate->addDays(1);
        foreach ($accounts as $account) {
            self::assertTrue(Money::CHF(0)->equals($account->getBalanceAtDate($openingDate)));
        }

        $this->expectExceptionMessage('Le bouclement a déjà été fait au 2019-12-31');
        $this->accounting->close($closingDate, $output);
    }
}
