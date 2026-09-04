<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\IndicatorDefinition;
use Application\Repository\IndicatorDefinitionRepository;
use ApplicationTest\Assert;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Cake\Chronos\ChronosDate;
use Money\Money;

/**
 * @phpstan-import-type ReportValue from IndicatorDefinitionRepository
 */
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

    public function testGetReportFromBeginningToDate(): void
    {
        $values = $this->getValues(null, new ChronosDate('2019-12-31'));

        Assert::assertMoney(Money::CHF(0), $values['Nautique - Bateau à moteur']);
        Assert::assertMoney(Money::CHF(1250), $values['Gestion - administration']);
        Assert::assertMoney(Money::CHF(9000), $values['Recette - Cours nautique']);
        Assert::assertMoney(Money::CHF(9000), $values['Recette - Cotisations']);
    }

    public function testGetReportFromBeginningToNow(): void
    {
        $values = $this->getValues(null, null);

        Assert::assertMoney(Money::CHF(0), $values['Nautique - Bateau à moteur']);
        Assert::assertMoney(Money::CHF(1250), $values['Gestion - administration']);
        Assert::assertMoney(Money::CHF(9000), $values['Recette - Cours nautique']);
        Assert::assertMoney(Money::CHF(9000), $values['Recette - Cotisations']);
    }

    public function testGetReportFromDateToNow(): void
    {
        // The photocopies were paid on 2019-03-10, the cotisation and the contribution to the
        // repair fund were both booked on 2019-03-12
        $values = $this->getValues(new ChronosDate('2019-03-11'), null);

        Assert::assertMoney(Money::CHF(0), $values['Gestion - administration'], 'the photocopies are before the start date');
        Assert::assertMoney(Money::CHF(9000), $values['Recette - Cotisations'], 'the cotisation is after it');
        Assert::assertMoney(Money::CHF(-1000), $values['Recette - Cours nautique'], 'only its subtrahend moved after the start date');
    }

    public function testGetReportFromDateToDate(): void
    {
        $values = $this->getValues(new ChronosDate('2019-01-01'), new ChronosDate('2019-12-31'));

        Assert::assertMoney(Money::CHF(0), $values['Nautique - Bateau à moteur']);
        Assert::assertMoney(Money::CHF(1250), $values['Gestion - administration']);
        Assert::assertMoney(Money::CHF(9000), $values['Recette - Cours nautique']);
        Assert::assertMoney(Money::CHF(9000), $values['Recette - Cotisations']);
    }

    public function testGetReportIncludesTheStartDateItself(): void
    {
        // The cotisation of 90.- was booked on 2019-03-12, so starting on that very day counts it in
        $fromTheDay = $this->getValues(new ChronosDate('2019-03-12'), null);
        Assert::assertMoney(Money::CHF(9000), $fromTheDay['Recette - Cotisations']);

        $fromTheDayAfter = $this->getValues(new ChronosDate('2019-03-13'), null);
        Assert::assertMoney(Money::CHF(0), $fromTheDayAfter['Recette - Cotisations']);
    }

    public function testGetReportAppliesTheMultiplierOfEachAccount(): void
    {
        // "Nautique - Bateau à moteur" depreciates its boat by 10% a year, but the fixture never
        // bought that boat. Point the formula at the sailing boat, acquired for 10'000.-, instead.
        $connection = $this->getEntityManager()->getConnection();
        $connection->update('indicator_definition_addend', ['account_id' => 10034], ['id' => 14000]);

        $values = $this->getValues(null, null);

        Assert::assertMoney(Money::CHF(100000), $values['Nautique - Bateau à moteur'], 'a tenth of the boat, and the three other accounts of the formula have nothing');
    }

    public function testGetReportComparesTheBudgetToTheValueOfTheIndicator(): void
    {
        $rows = $this->getRows(new ChronosDate('2019-01-01'), new ChronosDate('2019-12-31'));

        $administration = $rows['Gestion - administration'];
        $budgetBalance = $administration['budgetBalance'];
        self::assertNotNull($budgetBalance);

        Assert::assertMoney(Money::CHF(10000), $administration['budgetAllowed'], '65001 Photocopies is the only account of the formula with a budget');
        Assert::assertMoney(Money::CHF(8750), $budgetBalance, 'the 12.50 already spent leave that much of the budget');
    }

    public function testValueIsUnknownWhenAnAccountMixesIncompatibleTypes(): void
    {
        $connection = $this->getEntityManager()->getConnection();

        // 2030. Acomptes de clients, a group of liabilities, receives an asset account
        $connection->update('account', ['parent_id' => 10011], ['id' => 10026]);

        // and becomes the addend of "Recette - Cotisations"
        $connection->update('indicator_definition_addend', ['account_id' => 10011], ['id' => 14008]);

        $rows = $this->getRows(new ChronosDate('2019-01-01'), new ChronosDate('2019-12-31'));
        $cotisations = $rows['Recette - Cotisations'];

        self::assertNull($cotisations['value'], 'a group totalling an asset with liabilities has no balance to report');
        self::assertNull($cotisations['budgetBalance'], 'and there is nothing to compare the budget to');
    }

    /**
     * The value of each indicator, by indicator name.
     *
     * @return array<string, Money>
     */
    private function getValues(?ChronosDate $dateFrom, ?ChronosDate $dateTo): array
    {
        $values = [];
        foreach ($this->getRows($dateFrom, $dateTo) as $name => $row) {
            $value = $row['value'];
            self::assertNotNull($value, 'no indicator of the fixture totals incompatible account types');
            $values[$name] = $value;
        }

        return $values;
    }

    /**
     * The whole report, by indicator name.
     *
     * @return array<string, ReportValue>
     */
    private function getRows(?ChronosDate $dateFrom, ?ChronosDate $dateTo): array
    {
        $this->setCurrentUser('responsible');

        $rows = [];
        foreach ($this->repository->getReport($dateFrom, $dateTo) as $row) {
            $rows[$row['indicatorDefinition']->getName()] = $row;
        }

        return $rows;
    }
}
