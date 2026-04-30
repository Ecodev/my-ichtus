<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Enum\AccountWhere;
use Application\Model\TransactionLine;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;
use PHPUnit\Framework\Attributes\DataProvider;

class AccountOperatorTypeTest extends OperatorType
{
    use TestWithTransactionAndUser;

    #[DataProvider('providerGetDqlCondition')]
    public function testGetDqlCondition(int $expected, array $values, bool $not, bool $recursive, AccountWhere $where): void
    {
        $this->setCurrentUser('administrator');
        $values = [
            'values' => $values,
            'not' => $not,
            'recursive' => $recursive,
            'where' => $where->value,
        ];
        $actual = $this->getFilteredResult(TransactionLine::class, 'custom', 'account', $values);
        self::assertCount($expected, $actual);
    }

    public static function providerGetDqlCondition(): iterable
    {
        yield 'Both: lines affecting "Banque" account' => [4, [10025], false, false, AccountWhere::DebitOrCredit];
        yield 'Both: lines affecting "Informatique" account' => [0, [10015], false, false, AccountWhere::DebitOrCredit];
        yield 'Both: lines affecting one of those accounts' => [2, [10022, 10085], false, false, AccountWhere::DebitOrCredit];
        yield 'Both: lines NOT affecting "Banque" account, neither credit or debit' => [6, [10025], true, false, AccountWhere::DebitOrCredit];
        yield 'Both: lines NOT affecting any of those accounts' => [1, [10106, 10096], true, false, AccountWhere::DebitOrCredit];
        yield 'Both: lines NOT affecting any account (should not exist)' => [0, [], false, false, AccountWhere::DebitOrCredit];
        yield 'Both: lines affecting ANY account (should be all lines)' => [12, [], true, false, AccountWhere::DebitOrCredit];
        yield 'Both: parent account has no lines' => [0, [10000], false, false, AccountWhere::DebitOrCredit];
        yield 'Both: parent and all descendant accounts have lines' => [7, [10000], false, true, AccountWhere::DebitOrCredit];

        yield 'Debit: lines affecting "Banque" account' => [2, [10025], false, false, AccountWhere::Debit];
        yield 'Debit: lines affecting "Informatique" account' => [0, [10015], false, false, AccountWhere::Debit];
        yield 'Debit: lines affecting one of those accounts' => [2, [10022, 10085], false, false, AccountWhere::Debit];
        yield 'Debit: lines NOT affecting "Banque" account' => [8, [10025], true, false, AccountWhere::Debit];
        yield 'Debit: lines NOT affecting any of those accounts' => [6, [10106, 10096], true, false, AccountWhere::Debit];
        yield 'Debit: lines NOT affecting any account' => [2, [], false, false, AccountWhere::Debit];
        yield 'Debit: lines affecting ANY account' => [10, [], true, false, AccountWhere::Debit];
        yield 'Debit: parent account has no lines' => [0, [10000], false, false, AccountWhere::Debit];
        yield 'Debit: parent and all descendant accounts have lines' => [4, [10000], false, true, AccountWhere::Debit];

        yield 'Credit: lines affecting "Banque" account' => [2, [10025], false, false, AccountWhere::Credit];
        yield 'Credit: lines affecting "Informatique" account' => [0, [10015], false, false, AccountWhere::Credit];
        yield 'Credit: lines affecting one of those accounts' => [0, [10022, 10085], false, false, AccountWhere::Credit];
        yield 'Credit: lines NOT affecting "Banque" account' => [9, [10025], true, false, AccountWhere::Credit];
        yield 'Credit: lines NOT affecting any of those accounts' => [7, [10106, 10096], true, false, AccountWhere::Credit];
        yield 'Credit: lines NOT affecting any account' => [1, [], false, false, AccountWhere::Credit];
        yield 'Credit: lines affecting ANY account' => [11, [], true, false, AccountWhere::Credit];
        yield 'Credit: parent account has no lines' => [0, [10000], false, false, AccountWhere::Credit];
        yield 'Credit: parent and all descendant accounts have lines' => [3, [10000], false, true, AccountWhere::Credit];
    }
}
