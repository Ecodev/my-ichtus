<?php

declare(strict_types=1);

namespace ApplicationTest\Api\Input\Operator;

use Application\Api\Exception;
use Application\Api\Input\Operator\SearchOperatorType;
use Application\Model\Booking;
use Application\Model\Image;
use Application\Model\User;
use GraphQL\Doctrine\Factory\UniqueNameFactory;
use GraphQL\Type\Definition\Type;

class SearchOperatorTypeTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @dataProvider providerSearch
     *
     * @param string $class
     * @param string $term
     * @param int $expectedJoinCount
     * @param string $expected
     */
    public function testSearch(string $class, string $term, int $expectedJoinCount, string $expected): void
    {
        $operator = new SearchOperatorType(_types(), Type::string());

        $metadata = _em()->getClassMetadata($class);
        $unique = new UniqueNameFactory();
        $alias = 'a';
        $qb = _em()->getRepository($class)->createQueryBuilder($alias);
        $actual = $operator->getDqlCondition($unique, $metadata, $qb, $alias, 'non-used-field-name', ['value' => $term]);

        self::assertSame($expected, $actual);

        $joins = $qb->getDQLPart('join');
        self::assertCount($expectedJoinCount, $joins['a'] ?? []);
    }

    public function providerSearch(): array
    {
        return [
            'search predefined fields' => [
                User::class,
                'john',
                0,
                '(a.firstName LIKE :filter1 OR a.lastName LIKE :filter1 OR a.email LIKE :filter1 OR a.locality LIKE :filter1)',
            ],
            'split words' => [
                User::class,
                'john doe',
                0,
                '(a.firstName LIKE :filter1 OR a.lastName LIKE :filter1 OR a.email LIKE :filter1 OR a.locality LIKE :filter1) AND (a.firstName LIKE :filter2 OR a.lastName LIKE :filter2 OR a.email LIKE :filter2 OR a.locality LIKE :filter2)',
            ],
            'trimmed split words' => [
                User::class,
                '  foo   bar   ',
                0,
                '(a.firstName LIKE :filter1 OR a.lastName LIKE :filter1 OR a.email LIKE :filter1 OR a.locality LIKE :filter1) AND (a.firstName LIKE :filter2 OR a.lastName LIKE :filter2 OR a.email LIKE :filter2 OR a.locality LIKE :filter2)',
            ],
            'joined entities' => [
                Booking::class,
                'foo',
                2,
                '(a.destination LIKE :filter1 OR a.startComment LIKE :filter1 OR user1.firstName LIKE :filter1 OR user1.lastName LIKE :filter1 OR user1.email LIKE :filter1 OR user1.locality LIKE :filter1 OR bookable1.name LIKE :filter1 OR bookable1.code LIKE :filter1)',
            ],
        ];
    }

    public function testSearchOnEntityWithoutSearchableFieldMustThrow(): void
    {
        $operator = new SearchOperatorType(_types(), Type::string());

        $metadata = _em()->getClassMetadata(Image::class);
        $unique = new UniqueNameFactory();
        $alias = 'a';
        $qb = _em()->getRepository(Image::class)->createQueryBuilder($alias);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Cannot find fields to search on for entity Application\Model\Image');
        $operator->getDqlCondition($unique, $metadata, $qb, $alias, 'non-used-field-name', ['value' => 'foo']);
    }
}
