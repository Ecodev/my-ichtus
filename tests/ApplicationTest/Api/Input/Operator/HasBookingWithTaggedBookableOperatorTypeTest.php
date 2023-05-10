<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\BookableTag;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingWithTaggedBookableOperatorTypeTest extends OperatorType
{
    public function providerGetDqlCondition(): iterable
    {
        yield 'users renting any Stockage' => [2, [6008], null];
        yield 'users renting any Service' => [2, [6007], null];
        yield 'users renting any Voile légère' => [1, [6005], null];
        yield 'users renting a bookable with at least one of those tags' => [3, [6005, 6007], null];
        yield 'bookable tag without booking' => [0, [6004], null];
        yield 'users renting anything else than Stockage' => [4, [6008], true];
        yield 'users renting a bookable with any tag' => [4, null, true];
        yield 'users renting a bookable without any tag (fond de réparation)' => [1, null, false];
    }

    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, ?array $tags, ?bool $not): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $this->idsToEntityIds(BookableTag::class, $tags),
            'not' => $not,
        ];
        $actual = $this->getFilteredResult(User::class, 'custom', 'hasBookingWithTaggedBookable', $values);
        self::assertCount($expected, $actual);
    }
}
