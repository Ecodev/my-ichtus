<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\TransactionLine;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class TransactionWithDocumentOperatorTypeTest extends OperatorType
{
    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, ?array $values, ?bool $not): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $values,
            'not' => $not,
        ];
        $actual = $this->getFilteredResult(TransactionLine::class, 'custom', 'transactionWithDocument', $values);
        self::assertCount($expected, $actual);
    }

    public static function providerGetDqlCondition(): iterable
    {
        yield 'transaction IS WITH documents' => [1, [true], null];
        yield 'transaction IS WITHOUT document' => [11, [false], null];
        yield 'transaction WITH and WITHOUT documents' => [12, [true, false], null];
        yield 'transaction ALL documents (with+without) documents' => [12, null, true];
        yield 'transaction NONE documents' => [11, null, false];
        yield 'transaction IS NOT WITHOUT documents' => [1, [false], true];
    }
}
