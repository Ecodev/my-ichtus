<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\TransactionLine;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class TransactionWithDocumentOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            [1, [true]],
            [11, [false]],
            [12, [true, false]],
        ];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, array $values): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $values,
        ];
        $actual = $this->getFilteredResult(TransactionLine::class, 'custom', 'transactionWithDocument', $values);
        self::assertCount($expected, $actual);
    }
}
