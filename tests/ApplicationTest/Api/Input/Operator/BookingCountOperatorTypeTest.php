<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\User;
use Application\Repository\UserRepository;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class BookingCountOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): iterable
    {
        yield [2, 'Equal', 1];
        yield [1, 'Equal', 2];
        yield [3, 'GreaterOrEqual', 1];
        yield [3, 'Less', 4];
    }

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
    public function testGetDqlCondition(int $expected, string $comparison, int $count): void
    {
        $values = [
            'value' => $count,
        ];

        $actual = $this->getFilteredResult(User::class, 'bookingCount', 'bookingCount' . $comparison, $values);
        self::assertCount($expected, $actual);
    }
}
