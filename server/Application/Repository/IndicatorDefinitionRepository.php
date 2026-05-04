<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\Account;
use Application\Model\IndicatorDefinition;
use Application\Model\User;
use Cake\Chronos\ChronosDate;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Exception;
use Money\Money;

/**
 * @extends AbstractRepository<IndicatorDefinition>
 *
 * @phpstan-type IndicatorTerm int|array{0: int, 1?: int}
 * @phpstan-type Indicators list<array{sorting: int, name: string, addends: list<IndicatorTerm>, subtrahends: list<IndicatorTerm>}>
 * @phpstan-type ReportValue array{indicatorDefinition: IndicatorDefinition, value: Money, budgetAllowed: Money, budgetBalance: Money}
 */
class IndicatorDefinitionRepository extends AbstractRepository
{
    /**
     * Returns pure SQL to get ID of all objects that are accessible to given user.
     *
     * @param null|User $user
     */
    public function getAccessibleSubQuery(?\Ecodev\Felix\Model\User $user): string
    {
        if ($user && in_array($user->getRole(), [
            User::ROLE_ACCOUNTING_VERIFICATOR,
            User::ROLE_RESPONSIBLE,
            User::ROLE_ADMINISTRATOR,
        ], true)) {
            return '';
        }

        return '-1';
    }

    /**
     * @return list<ReportValue>
     */
    public function getReport(ChronosDate $dateFrom, ?ChronosDate $dateTo): array
    {
        $rsm = new ResultSetMappingBuilder($this->getEntityManager());
        $rsm->addRootEntityFromClassMetadata(IndicatorDefinition::class, 'indicator_definition');

        $qb = _em()->getConnection()->createQueryBuilder()
            ->from('indicator_definition')
            ->addSelect($rsm->generateSelectClause())
            ->addOrderBy('indicator_definition.sorting', 'ASC');

        $aclFilter = $this->getAclFilter()->addFilterConstraint($this->getEntityManager()->getClassMetadata(IndicatorDefinition::class), 'indicator_definition');
        if ($aclFilter) {
            $qb->andWhere($aclFilter);
        }

        $query = $this->getEntityManager()->createNativeQuery($qb->getSQL(), $rsm);
        $definitions = $query->getResult();

        $result = [];
        foreach ($definitions as $definition) {
            $value = $this->computeFormulaValue($definition, $dateFrom, $dateTo);
            $budgetAllowed = $this->computeFormulaBudgetAllowed($definition);
            $result[] = [
                'indicatorDefinition' => $definition,
                'value' => $value,
                'budgetAllowed' => $budgetAllowed,
                'budgetBalance' => $budgetAllowed->subtract($value),
            ];
        }

        return $result;
    }

    public function computeFormulaValue(IndicatorDefinition $definition, ChronosDate $dateFrom, ?ChronosDate $dateTo): Money
    {
        $valueStart = $this->computeFormulaValueAtDate($definition, $dateFrom);
        $valueEnd = $this->computeFormulaValueAtDate($definition, $dateTo ?? ChronosDate::today());

        return $valueEnd->subtract($valueStart);
    }

    private function computeFormulaValueAtDate(IndicatorDefinition $definition, ChronosDate $date): Money
    {
        $total = Money::CHF(0);
        foreach ($definition->getAddends() as $addend) {
            $balance = $addend->getAccount()->getBalanceAtDate($date);
            $ponderatedBalance = $this->applyMultiplier($balance, $addend->getMultiplier());
            $total = $total->add($ponderatedBalance);
        }

        foreach ($definition->getSubtrahends() as $subtrahend) {
            $balance = $subtrahend->getAccount()->getBalanceAtDate($date);
            $ponderatedBalance = $this->applyMultiplier($balance, $subtrahend->getMultiplier());
            $total = $total->subtract($ponderatedBalance);
        }

        return $total;
    }

    public function computeFormulaBudgetAllowed(IndicatorDefinition $definition): Money
    {
        $total = Money::CHF(0);
        foreach ($definition->getAddends() as $addend) {
            $budget = $addend->getAccount()->getBudgetAllowed();
            if ($budget !== null) {
                $total = $total->add($budget);
            }
        }

        foreach ($definition->getSubtrahends() as $subtrahend) {
            $budget = $subtrahend->getAccount()->getBudgetAllowed();
            if ($budget !== null) {
                $total = $total->add($budget);
            }
        }

        return $total;
    }

    private function applyMultiplier(Money $value, int $multiplier): Money
    {
        return $value->multiply($multiplier)->divide(100);
    }

    public function insertIndicators(): void
    {
        $connection = $this->getEntityManager()->getConnection();
        $connection->beginTransaction();
        foreach ($this->indicators() as $indicator) {
            ['addends' => $addends, 'subtrahends' => $subtrahends] = $indicator;
            unset($indicator['addends'], $indicator['subtrahends']);

            $connection->insert('indicator_definition', $indicator);
            $idIndicatorDefinition = (int) $connection->lastInsertId();

            foreach ($addends as $addend) {
                $this->insertOneRelation('indicator_definition_addend', $idIndicatorDefinition, $addend);
            }

            foreach ($subtrahends as $subtrahend) {
                $this->insertOneRelation('indicator_definition_subtrahend', $idIndicatorDefinition, $subtrahend);
            }
        }
        $connection->commit();
    }

    /**
     * @param IndicatorTerm $term
     */
    private function insertOneRelation(string $tablename, int $idIndicatorDefinition, int|array $term): void
    {
        [$accountCode, $multiplier] = $this->normalizeIndicatorTerm($term);

        /** @var AccountRepository $accountRepository */
        $accountRepository = _em()->getRepository(Account::class);
        $account = $accountRepository->findOneByCode($accountCode);
        if (!$account) {
            throw new Exception("Could not find account with code $accountCode");
        }

        $this->getEntityManager()->getConnection()->insert($tablename, [
            'indicator_definition_id' => $idIndicatorDefinition,
            'account_id' => $account->getId(),
            'multiplier' => $multiplier,
        ]);
    }

    /**
     * @param IndicatorTerm $term
     *
     * @return array{0: int, 1: int}
     */
    private function normalizeIndicatorTerm(int|array $term): array
    {
        if (is_int($term)) {
            return [$term, 100];
        }

        return [$term[0], $term[1] ?? 100];
    }

    /**
     * @return Indicators
     */
    private function indicators(): array
    {
        return [
            [
                'sorting' => 100,
                'name' => 'Nautique - Aviron',
                'addends' => [[15210, 20], 610012, 610013, 20309050],
                'subtrahends' => [15211],
            ],
            [
                'sorting' => 110,
                'name' => 'Nautique - Canoë & kayak',
                'addends' => [[15220, 25], 610022, 610023],
                'subtrahends' => [15221],
            ],
            [
                'sorting' => 120,
                'name' => 'Nautique - SUP',
                'addends' => [[15230, 25], 610052, 610053],
                'subtrahends' => [15231],
            ],
            [
                'sorting' => 130,
                'name' => 'Nautique - Planche à voile',
                'addends' => [[15240, 25], 610042, 610043, 610044],
                'subtrahends' => [15241],
            ],
            [
                'sorting' => 140,
                'name' => 'Nautique - Wingfoil',
                'addends' => [[15290, 25], 610032, 610034],
                'subtrahends' => [15291],
            ],
            [
                'sorting' => 150,
                'name' => 'Nautique - Voile légère',
                'addends' => [[15250, 20], 610061, 610062, 610063],
                'subtrahends' => [15250],
            ],
            [
                'sorting' => 160,
                'name' => 'Nautique - Voile lestée',
                'addends' => [[15260, 20], 610071, 610072, 610073, 610074, 610075],
                'subtrahends' => [15261],
            ],

            // Infra
            [
                'sorting' => 180,
                'name' => 'Infra - locaux + places + ass',
                'addends' => [[15105, 10], 68014, [15107, 10], 68015, 6000, 6050, 6300],
                'subtrahends' => [],
            ],
            [
                'sorting' => 190,
                'name' => 'Infra - aménagement local',
                'addends' => [[15101, 25], 68012, [15103, 10], 68013],
                'subtrahends' => [],
            ],
            [
                'sorting' => 200,
                'name' => 'Infra - gilets, combis',
                'addends' => [[15280, 25], 15281, 61020],
                'subtrahends' => [],
            ],
            [
                'sorting' => 210,
                'name' => 'Infra - outillage',
                'addends' => [[1500, 25], 68010],
                'subtrahends' => [],
            ],
            [
                'sorting' => 220,
                'name' => 'Infra - véhicules',
                'addends' => [[15310, 20], [15320, 20], 68030, 68040, 6200],
                'subtrahends' => [36005],
            ],
            [
                'sorting' => 230,
                'name' => 'Infra - bateaux moteur',
                'addends' => [[15270, 10], 68020, 61010],
                'subtrahends' => [15271],
            ],

            // Management
            [
                'sorting' => 240,
                'name' => 'Gestion - indemnités RH',
                'addends' => [5901],
                'subtrahends' => [],
            ],
            [
                'sorting' => 250,
                'name' => 'Gestion - Cours, formations, camps',
                'addends' => [4200, 4250, 4600, 5902, 5903, 6550],
                'subtrahends' => [],
            ],
            [
                'sorting' => 260,
                'name' => 'Gestion - gestion, admin, taxes',
                'addends' => [[1505, 25], 6350, 6400, 6500, 6540, 6590, 68011],
                'subtrahends' => [],
            ],
            [
                'sorting' => 270,
                'name' => 'Gestion - manifestations',
                'addends' => [4300, 4500],
                'subtrahends' => [],
            ],
            [
                'sorting' => 280,
                'name' => 'Gestion - fonds de solidarité',
                'addends' => [6600],
                'subtrahends' => [],
            ],
            [
                'sorting' => 290,
                'name' => 'Gestion - divers et imprévus',
                'addends' => [6560, 6700],
                'subtrahends' => [],
            ],

            // Revenue
            [
                'sorting' => 300,
                'name' => 'Recette - Cotisation et licences',
                'addends' => [34001],
                'subtrahends' => [3900],
            ],
            [
                'sorting' => 310,
                'name' => 'Recette - Location stockage privé',
                'addends' => [34002],
                'subtrahends' => [],
            ],
            [
                'sorting' => 320,
                'name' => 'Recette - Cours, entrainements',
                'addends' => [34003, 34005],
                'subtrahends' => [],
            ],
            [
                'sorting' => 330,
                'name' => 'Recette - Semaines Nautiques, camps',
                'addends' => [34004, 36003],
                'subtrahends' => [],
            ],
            [
                'sorting' => 340,
                'name' => 'Recette - Subsides (J+S, Swiss Olympic…)',
                'addends' => [36004],
                'subtrahends' => [],
            ],
            [
                'sorting' => 350,
                'name' => 'Recette - Manifestations',
                'addends' => [36001],
                'subtrahends' => [],
            ],
            [
                'sorting' => 360,
                'name' => 'Recette - Sponsoring',
                'addends' => [36007],
                'subtrahends' => [],
            ],
            [
                'sorting' => 370,
                'name' => 'Recette - Divers',
                'addends' => [3200, 36006],
                'subtrahends' => [],
            ],
        ];
    }

    /**
     * Insert indicator definitions if there are none yet.
     */
    public function insertMissingIndicatorDefinition(): bool
    {
        if ($this->count([])) {
            return false;
        }

        $this->insertIndicators();

        return true;
    }
}
