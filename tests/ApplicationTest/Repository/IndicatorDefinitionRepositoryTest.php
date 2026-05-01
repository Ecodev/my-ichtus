<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\IndicatorDefinition;
use Application\Repository\IndicatorDefinitionRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Cake\Chronos\ChronosDate;
use Money\Money;

class IndicatorDefinitionRepositoryTest extends AbstractRepository
{
    use LimitedAccessSubQuery;

    private IndicatorDefinitionRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = _em()->getRepository(IndicatorDefinition::class);
    }

    public static function providerGetAccessibleSubQuery(): iterable
    {
        $all = range(14000, 14003);

        yield ['anonymous', []];
        yield ['bookingonly', []];
        yield ['individual', []];
        yield ['member', []];
        yield ['trainer', []];
        yield ['formationresponsible', []];
        yield ['verificator', $all];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }

    public function testComputeFormulaValueFromFixture(): void
    {
        $this->setCurrentUser('responsible');

        $report = $this->repository->getReport(new ChronosDate('2019-01-01'), new ChronosDate('2019-12-31'));

        self::assertCount(4, $report);
        self::assertSame(14000, $report[0]['indicatorDefinition']->getId());
        self::assertSame(14001, $report[1]['indicatorDefinition']->getId());
        self::assertSame(14002, $report[2]['indicatorDefinition']->getId());
        self::assertSame(14003, $report[3]['indicatorDefinition']->getId());

        self::assertTrue(Money::CHF(0)->equals($report[0]['value']));
        self::assertTrue(Money::CHF(1250)->equals($report[1]['value']));
        self::assertTrue(Money::CHF(9000)->equals($report[2]['value']));
        self::assertTrue(Money::CHF(9000)->equals($report[3]['value']));

        self::assertTrue(Money::CHF(100000)->equals($report[0]['budgetAllowed']));
        self::assertTrue(Money::CHF(100000)->equals($report[0]['budgetBalance']));
        self::assertTrue(Money::CHF(10000)->equals($report[1]['budgetAllowed']));
        self::assertTrue(Money::CHF(8750)->equals($report[1]['budgetBalance']));
    }
}
