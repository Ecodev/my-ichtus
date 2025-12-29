<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator\HasCreditOnDate;

use Application\Model\User;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;
use PHPUnit\Framework\Attributes\DataProvider;

class HasCreditOnDateNullOperatorTypeTest extends OperatorType
{
    use TestWithTransactionAndUser;

    #[DataProvider('providerGetDqlCondition')]
    public function testGetDqlCondition(int $expected, bool $not): void
    {
        $this->setCurrentUser('administrator');

        $values = [
            'not' => $not,
        ];

        $actual = $this->getFilteredResult(User::class, 'hasCreditOnDate', 'hasCreditOnDateNull', $values);
        self::assertCount($expected, $actual);
    }

    public static function providerGetDqlCondition(): iterable
    {
        yield [15, false];
        yield [1, true];
    }
}
