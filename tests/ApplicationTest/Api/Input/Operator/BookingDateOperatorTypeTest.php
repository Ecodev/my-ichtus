<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\User;
use Cake\Chronos\ChronosDate;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class BookingDateOperatorTypeTest extends OperatorType
{
    protected function setUp(): void
    {
        // Login as administrator to see all users
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        $administrator->setLogin('jane');
        User::setCurrent($administrator);
        parent::setUp();
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, string $comparison, ChronosDate $date): void
    {
        $values = [
            'value' => $date,
        ];

        $actual = $this->getFilteredResult(User::class, 'bookingDate', 'bookingDate' . $comparison, $values);
        self::assertCount($expected, $actual);
    }

    public static function providerGetDqlCondition(): iterable
    {
        yield [1, 'Less', new ChronosDate('2018-01-02')];
        yield [3, 'GreaterOrEqual', new ChronosDate('2018-01-01')];
        yield [3, 'GreaterOrEqual', new ChronosDate('2018-01-02')];
    }
}
