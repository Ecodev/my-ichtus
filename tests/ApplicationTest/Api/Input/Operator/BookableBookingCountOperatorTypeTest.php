<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\Bookable;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class BookableBookingCountOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): array
    {
        return [
            [3, 'Equal', 2],
            [8, 'Equal', 1],
            [11, 'GreaterOrEqual', 1],
            [13, 'Less', 1],
        ];
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

        $actual = $this->getFilteredResult(Bookable::class, 'bookableBookingCount', 'bookableBookingCount' . $comparison, $values);
        self::assertCount($expected, $actual);
    }
}
