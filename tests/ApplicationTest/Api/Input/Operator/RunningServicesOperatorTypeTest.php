<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\Booking;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;
use PHPUnit\Framework\Attributes\DataProvider;

class RunningServicesOperatorTypeTest extends OperatorType
{
    #[DataProvider('providerGetDqlCondition')]
    public function testGetDqlCondition(int $expected, int $userId): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'user' => $this->idToEntityId(User::class, $userId),
            'coursesOnly' => false,
            'excludeNFT' => false,
        ];
        $actual = $this->getFilteredResult(Booking::class, 'custom', 'runningServices', $values);
        self::assertCount($expected, $actual);
    }

    public static function providerGetDqlCondition(): iterable
    {
        yield 'user 1000' => [0, 1000];
        yield 'user 1001' => [0, 1001];
        yield 'user 1002' => [3, 1002];
        yield 'user 1003' => [0, 1003];
        yield 'user 1004' => [0, 1004];
        yield 'user 1005' => [1, 1005];
        yield 'user 1006' => [0, 1006];
        yield 'user 1007' => [0, 1007];
        yield 'user 1008' => [1, 1008];
        yield 'user 1009, has one expired course and one non-expired course' => [1, 1009];
        yield 'user 1010' => [0, 1010];
        yield 'user 1011' => [0, 1011];
        yield 'user 1012' => [1, 1012];
        yield 'user 1013' => [0, 1013];
        yield 'user 1014' => [0, 1014];
        yield 'user 1015' => [0, 1015];
    }
}
