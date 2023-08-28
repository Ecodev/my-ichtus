<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Model\Account;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Cake\Chronos\ChronosDate;
use Ecodev\Felix\Api\Exception;
use Money\Money;
use PHPUnit\Framework\TestCase;

class AccountTest extends TestCase
{
    public function testUserRelation(): void
    {
        $account = new Account();
        self::assertNull($account->getOwner());

        $user = new User();
        User::setCurrent($user);
        $account->setOwner($user);

        self::assertSame($account->getOwner(), $user);
        self::assertSame($account, $user->getAccount());

        $otherUser = new User();
        $account->setOwner($otherUser);
        self::assertSame($otherUser, $account->getOwner(), 'Account must have second user');
        self::assertNull($user->getAccount(), 'First user must have no account');
        self::assertSame($account, $otherUser->getAccount(), 'second user must have account');

        User::setCurrent($otherUser);
        $account->setOwner(null);
        self::assertNull($account->getOwner(), 'Account must have no user');
        self::assertNull($user->getAccount(), 'First user must have no account');
        self::assertNull($otherUser->getAccount(), 'Second user must have no account');
    }

    public function testTree(): void
    {
        $a = new Account();
        $b = new Account();
        $c = new Account();

        $b->setParent($a);
        $c->setParent($a);

        self::assertCount(2, $a->getChildren());

        $c->setParent(null);

        self::assertCount(1, $a->getChildren());
    }

    public function testIban(): void
    {
        $account = new Account();

        self::assertEmpty($account->getIban());

        $iban = 'CH6303714697192579556';
        $account->setIban($iban);
        self::assertSame($iban, $account->getIban());

        $germanIban = 'DE75512108001245126199';
        $account->setIban($germanIban);
        self::assertSame($germanIban, $account->getIban());

        $this->expectException(Exception::class);
        $invalidIban = 'CH123456789012345678';
        $account->setIban($invalidIban);
    }

    public function testBalanceAtDate(): void
    {
        /** @var AccountRepository $accountRepository */
        $accountRepository = _em()->getRepository(Account::class);

        // Past balance from an asset account
        // 10201: PostFinance
        $bank = $accountRepository->getOneById(10025);

        $balance = $bank->getBalanceAtDate(new ChronosDate('2019-03-01'));
        self::assertTrue(Money::CHF(800000)->equals($balance));

        $balance = $bank->getBalanceAtDate(new ChronosDate('2019-05-01'));
        self::assertTrue(Money::CHF(818750)->equals($balance));

        // Past balance from a group account
        // 6: Autres charges exploitation
        $otherExpenses = $accountRepository->getOneById(10005);

        $balance = $otherExpenses->getBalanceAtDate(new ChronosDate('2019-03-01'));
        self::assertTrue(Money::CHF(0)->equals($balance));

        $balance = $otherExpenses->getBalanceAtDate(new ChronosDate('2019-03-12'));
        self::assertTrue(Money::CHF(1250)->equals($balance));
    }
}
