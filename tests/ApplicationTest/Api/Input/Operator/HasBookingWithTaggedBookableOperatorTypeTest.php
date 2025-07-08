<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Model\BookableTag;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\Input\Operator\OperatorType;

class HasBookingWithTaggedBookableOperatorTypeTest extends OperatorType
{
    /**
     * @dataProvider providerGetDqlCondition
     */
    public function testGetDqlCondition(int $expected, ?array $tags, ?bool $not, bool $sameBooking = true): void
    {
        $administrator = new User(User::ROLE_ADMINISTRATOR);
        User::setCurrent($administrator);
        $values = [
            'values' => $this->idsToEntityIds(BookableTag::class, $tags),
            'not' => $not,
            'sameBooking' => $sameBooking,
        ];
        $actual = $this->getFilteredResult(User::class, 'custom', 'hasBookingWithTaggedBookable', $values);
        self::assertCount($expected, $actual);
    }

    public static function providerGetDqlCondition(): iterable
    {
        yield 'users renting any Stockage (with shared join booking)' => [3, [6008], null, false];
        yield 'users renting any Stockage' => [3, [6008], null];
        yield 'users renting any Service' => [2, [6007], null];
        yield 'users renting any Voile légère' => [1, [6005], null];
        yield 'users renting a bookable with at least one of those tags' => [3, [6005, 6007], null];
        yield 'bookable tag without booking' => [0, [6004], null];
        yield 'users renting anything else than Stockage' => [5, [6008], true];
        yield 'users renting anything else than Casier' => [5, [6010], true];
        yield 'users renting anything else than Stockage demande' => [5, [6028], true];
        yield 'users renting anything else than Armoire' => [6, [6009], true];
        yield 'users renting anything else than Flotteurs' => [6, [6011], true];
        yield 'users renting a bookable with any tag' => [6, null, true];
        yield 'users renting a bookable without any tag (fond de réparation)' => [1, null, false];
    }

    /**
     * @dataProvider providerCanCombineFilters
     */
    public function testCanCombineFilters(int $expected, callable $conditions): void
    {
        $filter = [
            'groups' => [
                [
                    'groupLogic' => 'AND',
                    'conditionsLogic' => 'AND',
                    'conditions' => [
                        [
                            'custom' => $conditions(),
                        ],
                    ],
                ],
            ],
        ];

        $actual = _types()->createFilteredQueryBuilder(User::class, $filter, [])->getQuery()->getResult();

        self::assertCount($expected, $actual);
    }

    public function providerCanCombineFilters(): iterable
    {
        yield 'users with running bookings that are for SUP' => [0, fn () => [
            'hasBookingCompleted' => [
                'values' => [false],
                'not' => false,
            ],
            'hasBookingWithTaggedBookable' => [
                'values' => $this->idsToEntityIds(BookableTag::class, [6000]),
                'not' => false,
                'sameBooking' => true,
            ],
        ]];

        yield 'users with running bookings, and that also have any other bookings for SUP' => [1, fn () => [
            'hasBookingCompleted' => [
                'values' => [false],
                'not' => false,
            ],
            'hasBookingWithTaggedBookable' => [
                'values' => $this->idsToEntityIds(BookableTag::class, [6000]),
                'not' => false,
                'sameBooking' => false,
            ],
        ]];
    }
}
