<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\TransactionLine;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class CreditOrDebitAccountOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            'lines affecting that account' => [4, [10025], null],
            'other lines affecting that account' => [0, [10015], null],
            'lines affecting no account' => [0, [], null],
            'lines affecting one of those accounts' => [2, [10022, 10085], null],
            'lines NOT affecting that account, neither credit or debit' => [7, [10106], true],
            'lines NOT affecting any of those accounts' => [1, [10106, 10096], true],
            'lines NOT affecting any account (should not exist)' => [0, [], false],
            'lines affecting ANY account' => [12, [], true],
        ];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, array $values, ?bool $not): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $values,
            'not' => $not,
        ];
        $actual = $this->getFilteredResult(TransactionLine::class, 'custom', 'creditOrDebitAccount', $values);
        self::assertCount($expected, $actual);
    }
}
