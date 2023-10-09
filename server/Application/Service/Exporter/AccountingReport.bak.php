<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use Cake\Chronos\ChronosDate;
use Ecodev\Felix\Format;
use Money\Money;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

/**
 * @extends AbstractExcel<Account>
 *
 * @phpstan-type Data array{
 *     account: ?Account,
 *     code: int | '',
 *     name: string,
 *     depth: int,
 *     balance: Money,
 *     balancePrevious: ?Money,
 *     budgetAllowed: ?Money,
 *     budgetBalance: ?Money,
 *     format?: array,
 *     formatPrevious?: array,
 * }
 */
class AccountingReport extends AbstractExcel
{
    private ChronosDate $date;

    private bool $showBudget;

    /**
     * @var Data[]
     */
    private array $assets = [];

    private array $liabilities = [];

    private array $expenses = [];

    private array $revenues = [];

    private static array $balanceFormat = [
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'argb' => 'FFDDDDDD',
            ],
        ],
        'numberFormat' => [
            'formatCode' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // eg. 12'345.67
        ],
    ];

    private static array $columnWidth = [
        'accountCode' => 11,
        'accountName' => 35,
        'balance' => 12,
    ];

    /**
     * Row where the numerical data start.
     */
    protected int $initialRow;

    /**
     * Column where the numerical data start.
     */
    protected int $initialColumn;

    public function __construct(string $hostname, private readonly array $accountingConfig)
    {
        parent::__construct($hostname);

        $this->date = ChronosDate::today();

        $this->sheet->setTitle('Bilan + PP');
        $this->zebra = false;
        $this->autoFilter = false;
    }

    protected function getTitleForFilename(): string
    {
        return sprintf('compta_rapport_%s', $this->date->format('Y-m-d'));
    }

    public function setDate(ChronosDate $date): void
    {
        $this->date = $date;
    }

    public function showBudget(bool $showBudget): void
    {
        $this->showBudget = $showBudget;
    }

    protected function writeTitle(): void
    {
        $this->column = 1;
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + 14, $this->row]);
        $this->write(
            sprintf($this->hostname . ': rapport comptable au %s', $this->date->format('d.m.Y')),
            self::$titleFormat,
            self::$centerFormat
        );
        $this->sheet->getRowDimension($this->row)->setRowHeight(35);
        ++$this->row;

        $this->column = 1;
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + 6, $this->row]);
        $this->write(
            'Bilan',
            self::$titleFormat,
            self::$centerFormat
        );
        $this->column = 9;
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + 6, $this->row]);
        $this->write(
            'Résultat',
            self::$titleFormat,
            self::$centerFormat
        );

        $this->sheet->getRowDimension($this->row)->setRowHeight(35);
        ++$this->row;
    }

    /**
     * @param array<Account> $accounts
     */
    private function processAccounts(array $accounts, int $depth): void
    {
        foreach ($accounts as $account) {
            $balance = $account->getBalanceAtDate($this->date);
            if ($this->accountingConfig['report']['showAccountsWithZeroBalance'] === false && $depth > 1 && $balance->isZero()) {
                continue;
            }
            if ($account->getType() === AccountTypeType::EQUITY) {
                // Don't show special accounts since it's an interim statement, their balance will be computed manually
                continue;
            }
            $data = [
                'code' => $account->getCode(),
                'name' => Format::truncate($account->getName(), 55),
                'depth' => $depth,
                'balance' => $balance,
                'account' => $account,
            ];
            if ($this->showBudget) {
                $data['balancePrevious'] = $account->getTotalBalanceFormer();
                $data['budgetAllowed'] = $account->getBudgetAllowed();
                $data['budgetBalance'] = $account->getBudgetBalance();
            }
            if ($account->getType() === AccountTypeType::ASSET || ($account->getType() === AccountTypeType::GROUP && mb_substr((string) $account->getCode(), 0, 1) === '1')) {
                $this->assets[] = $data;
            } elseif ($account->getType() === AccountTypeType::LIABILITY || ($account->getType() === AccountTypeType::GROUP && mb_substr((string) $account->getCode(), 0, 1) === '2')) {
                $this->liabilities[] = $data;
            } elseif ($account->getType() === AccountTypeType::REVENUE || ($account->getType() === AccountTypeType::GROUP && mb_substr((string) $account->getCode(), 0, 1) === '3')) {
                $this->revenues[] = $data;
            } elseif ($account->getType() === AccountTypeType::EXPENSE || ($account->getType() === AccountTypeType::GROUP && in_array(mb_substr((string) $account->getCode(), 0, 1), ['4', '5', '6'], true))) {
                $this->expenses[] = $data;
            }
            if ($account->getType() === AccountTypeType::GROUP && $depth <= $this->accountingConfig['report']['maxAccountDepth'] && $account->getCode() !== $this->accountingConfig['customerDepositsAccountCode']) {
                $children = $account->getChildren()->toArray();
                $this->processAccounts($children, $depth + 1);
            }
        }
    }

    protected function writeDataAssets(): void
    {
        $this->column = $this->initialColumn = 1;
        $this->initialRow = $this->row;
        $firstLine = true;
        $this->lastDataRow = $this->row;
        foreach ($this->assets as $index => $data) {
            // Account code
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $format = ['font' => ['bold' => $data['depth'] <= 2]];
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            // Account name
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            // Account balance
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->assets[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat);

            if ($this->showBudget) {
                // Account balance former
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                }
                $this->assets[$index]['balancePreviousCell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($data['balancePrevious'], self::$balanceFormat);

                // Account budget allowed
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                }
                $this->assets[$index]['budgetAllowedCell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($data['budgetAllowed'], self::$balanceFormat);

                // Account budget balance
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                }
                $this->assets[$index]['budgetBalanceCell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($data['budgetBalance'], self::$balanceFormat);
            }

            $firstLine = false;
            ++$this->row;
            $this->column = $this->initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }
    }

    protected function writeDataLiabilities(): void
    {
        $this->row = $this->initialRow;
        $this->column = $this->initialColumn = $this->initialColumn + 4;
        $firstLine = true;
        foreach ($this->liabilities as $index => $data) {
            // Account code
            $format = ['font' => ['bold' => $data['depth'] <= 2]];
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );

            // Account name
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }

            // Account balance
            // Store the coordinate of the cell to later compute totals
            $this->liabilities[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat);
            $firstLine = false;
            ++$this->row;
            $this->column = $this->initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }
    }

    protected function writeDataExpenses(): void
    {
        $this->row = $this->initialRow;
        $this->column = $this->initialColumn = $this->initialColumn + 4;
        $firstLine = true;
        foreach ($this->expenses as $index => $data) {
            // Account code
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $format = ['font' => ['bold' => $data['depth'] === 1]];
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );

            // Account name
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);

            // Account balance
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->expenses[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat);

            $firstLine = false;
            ++$this->row;
            $this->column = $this->initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }
    }

    protected function writeDataRevenues(): void
    {
        $this->row = $this->initialRow;
        $this->column = $this->initialColumn = $this->initialColumn + 4;
        $firstLine = true;
        foreach ($this->revenues as $index => $data) {
            // Account code
            $format = ['font' => ['bold' => $data['depth'] === 1]];
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );

            // Account name
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);

            // Account balance
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->revenues[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat);
            $format = ['font' => ['bold' => $data['depth'] === 1]];
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }

            $firstLine = false;
            ++$this->row;
            $this->column = $this->initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }
    }

    /**
     * @param Account[] $items
     */
    protected function writeData(array $items): void
    {
        $this->processAccounts($items, 1);

        $this->sheet->setShowGridlines(false);

        $profitOrLoss = $this->getProfitOrLoss();

        if ($profitOrLoss->isNegative()) {
            // A loss is written at the end of the Revenues and Assets columns
            $data = [
                'code' => '',
                'name' => 'Résultat intermédiaire (perte)',
                'depth' => 1,
                'balance' => $profitOrLoss->absolute(),
                'account' => null,
                'format' => ['font' => ['color' => ['argb' => Color::COLOR_RED]]],
            ];
            $this->revenues[] = $data;
            $this->assets[] = $data;
        } else {
            // A profit is written at the end of the Expenses and Liabilities columns
            $data = [
                'code' => '',
                'name' => 'Résultat intermédiaire (bénéfice)',
                'depth' => 1,
                'balance' => $profitOrLoss,
                'account' => null,
                'format' => ['font' => ['color' => ['argb' => Color::COLOR_DARKGREEN]]],
            ];
            $this->expenses[] = $data;
            $this->liabilities[] = $data;
        }

        $this->writeDataAssets();

        $this->writeDataLiabilities();

        $this->writeDataExpenses();

        $this->writeDataRevenues();

        $this->applyExtraFormatting();
    }

    private function getProfitOrLoss(): Money
    {
        // Sum the profit and loss root accounts
        $totalRevenues = $this->sumBalance($this->revenues);

        $totalExpenses = $this->sumBalance($this->expenses);

        return $totalRevenues->subtract($totalExpenses);
    }

    protected function getHeaders(): array
    {
        $headers = [];
        $headers[] = ['label' => 'Actifs', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 2];
        $headers[] = ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }
        $headers[] = ['label' => '', 'width' => 3, 'formats' => []]; // margin
        $headers[] = ['label' => 'Passifs', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 2];
        $headers[] = ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        $headers[] = ['label' => '', 'width' => 5, 'formats' => []]; // margin

        $headers[] = ['label' => 'Charges', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 2];
        $headers[] = ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }
        $headers[] = ['label' => '', 'width' => 3, 'formats' => []]; // margin
        $headers[] = ['label' => 'Profits', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 2];
        $headers[] = ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        return $headers;
    }

    protected function writeFooter(): void
    {
        $this->initialColumn = $this->column;

        // BALANCE SHEET

        // Assets
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');
        // Account.balance
        $this->writeSum($this->assets);
        if ($this->showBudget) {
            $this->write('');
            $this->write('');
            $this->write('');
        }

        // Margin
        $this->write('');

        // Liabilities
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');
        // Account.balance
        $this->writeSum($this->liabilities);
        if ($this->showBudget) {
            $this->write('');
            $this->write('');
            $this->write('');
        }

        // Margin
        $this->write('');

        // INCOME STATEMENT

        // Expenses
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');
        // Account.balance
        $this->writeSum($this->expenses);
        if ($this->showBudget) {
            $this->write('');
            $this->write('');
            $this->write('');
        }

        // Margin
        $this->write('');

        // Revenues
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');
        // Account.balance
        $this->writeSum($this->revenues);
        if ($this->showBudget) {
            $this->write('');
            $this->write('');
            $this->write('');
        }

        // Apply style
        $range = Coordinate::stringFromColumnIndex($this->initialColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->column - 1) . $this->row;
        $this->sheet->getStyle($range)->applyFromArray(self::$totalFormat);
    }

    private function applyExtraFormatting(): void
    {
        // Format balance numbers
        $numericCols = $this->showBudget ? [3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26] : [3, 7, 11, 15];
        foreach ($numericCols as $colIndex) {
            $range = Coordinate::stringFromColumnIndex($colIndex) . 4 . ':' . Coordinate::stringFromColumnIndex($colIndex) . $this->lastDataRow;
            $this->sheet->getStyle($range)->applyFromArray(self::$balanceFormat);
        }

        // Increase row height since account names can wrap on multiple lines
        for ($r = 4; $r <= $this->lastDataRow; ++$r) {
            $this->sheet->getRowDimension($r)->setRowHeight(30);
        }
    }

    private function writeSum(array $data): void
    {
        $cellsToSum = $this->cellsToSum($data);
        $sum = $cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '';
        $this->write($sum, self::$balanceFormat, self::$totalFormat);
    }

    private function cellsToSum(array $data): array
    {
        $cells = array_reduce($data, function (array $carry, $data) {
            if (isset($data['cell']) && ($data['depth'] === 1 || (int) mb_substr((string) $data['code'], 0, 1) > 6)) {
                $carry[] = $data['cell'];
            }

            return $carry;
        }, []);

        return $cells;
    }

    private function sumBalance(array $data): Money
    {
        $sum = array_reduce($data, function (Money $carry, $data) {
            if ($data['depth'] === 1 || (int) mb_substr((string) $data['code'], 0, 1) > 6) {
                return $carry->add($data['balance']);
            }

            return $carry;
        }, Money::CHF(0));

        return $sum;
    }
}
