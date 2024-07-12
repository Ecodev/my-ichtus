<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Application\Enum\AccountType;
use Application\Model\Account;
use Cake\Chronos\ChronosDate;
use Ecodev\Felix\Format;
use Money\Money;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

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
 * }
 */
class AccountingReport extends AbstractExcel
{
    private ChronosDate $date;

    private bool $showBudget = false;

    /**
     * @var Data[]
     */
    private array $assets = [];

    /**
     * @var Data[]
     */
    private array $liabilities = [];

    /**
     * @var Data[]
     */
    private array $expenses = [];

    /**
     * @var Data[]
     */
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

    private static array $wrappedFormat = [
        'alignment' => [
            'wrapText' => true,
        ],
    ];

    private static array $indentFormat = [
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_LEFT,
            'indent' => 1,
        ],
    ];

    private static array $columnWidth = [
        'accountCode' => 11,
        'accountName' => 38,
        'balance' => 12,
    ];

    public function __construct(string $hostname, private readonly array $accountingConfig)
    {
        parent::__construct($hostname);

        $this->zebra = false;
        $this->autoFilter = false;
        $this->date = ChronosDate::today();

        $this->sheet->setTitle(_tr('Bilan') . ' & ' . _tr('Résultat'));
    }

    protected function getTitleForFilename(): string
    {
        return _tr('compta_rapport_%date%', ['date' => $this->date->format('Y-m-d')]);
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
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + ($this->showBudget ? 12 : 6), $this->row]);
        $this->write(
            sprintf($this->hostname . ': rapport comptable au %s', $this->date->format('d.m.Y')),
            self::$titleFormat,
            self::$centerFormat
        );
        $this->sheet->getRowDimension($this->row)->setRowHeight(35);
        ++$this->row;
    }

    private function processAccount(Account $account, int $depth): void
    {
        $balance = $account->getBalanceAtDate($this->date);
        if ($this->accountingConfig['report']['showAccountsWithZeroBalance'] === false && $depth > 1 && $balance->isZero()) {
            return;
        }

        if ($account->getType() === AccountType::Equity) {
            // Don't show special accounts since it's an interim statement, their balance will be computed manually
            return;
        }

        $data = [
            'code' => $account->getCode(),
            'name' => Format::truncate($account->getName(), 55),
            'depth' => $depth,
            'balance' => $balance,
            'balancePrevious' => $this->showBudget ? $account->getTotalBalanceFormer() : null,
            'budgetAllowed' => $this->showBudget ? $account->getBudgetAllowed() : null,
            'budgetBalance' => $this->showBudget ? $account->getBudgetBalance() : null,
            'account' => $account,
        ];

        $accountClasses = $this->accountingConfig['report']['accountClasses'];
        if ($account->getType() === AccountType::Asset || ($account->getType() === AccountType::Group && in_array(mb_substr((string) $account->getCode(), 0, 1), $accountClasses['assets'], true))) {
            $this->assets[] = $data;
        } elseif ($account->getType() === AccountType::Liability || ($account->getType() === AccountType::Group && in_array(mb_substr((string) $account->getCode(), 0, 1), $accountClasses['liabilities'], true))) {
            $this->liabilities[] = $data;
        } elseif ($account->getType() === AccountType::Revenue || ($account->getType() === AccountType::Group && in_array(mb_substr((string) $account->getCode(), 0, 1), $accountClasses['revenues'], true))) {
            $this->revenues[] = $data;
        } elseif ($account->getType() === AccountType::Expense || ($account->getType() === AccountType::Group && in_array(mb_substr((string) $account->getCode(), 0, 1), $accountClasses['expenses'], true))) {
            $this->expenses[] = $data;
        }

        if ($account->getType() === AccountType::Group && $depth <= $this->accountingConfig['report']['maxAccountDepth']) {
            foreach ($account->getChildren() as $child) {
                $this->processAccount($child, $depth + 1);
            }
        }
    }

    /**
     * @param Account $item
     */
    protected function writeItem($item): void
    {
        // This is unusual because we don't write anything but only collect data for later
        $this->processAccount($item, 1);
    }

    /**
     * Compute the profit or loss (at current and previous dates) and insert the result into the list of accounts.
     */
    private function insertProfitOrLoss(): void
    {
        $profitOrLoss = $this->getProfitOrLoss(false);

        if ($profitOrLoss->isZero()) {
            return; // If financial result is balanced, it likely a final accounting report so we don't show the intermediate result
        }

        $data = [
            'depth' => 1,
            'code' => '',
            'name' => _tr('Résultat intermédiaire (bénéfice / -perte)'),
            'account' => null,
            'balance' => $profitOrLoss, // can be positive of negative
            'balancePrevious' => null,
            'budgetAllowed' => null,
            'budgetBalance' => null,
            'format' => $this->color($profitOrLoss),
        ];

        // A profit is reported as a POSITIVE green number, and a loss is reported a NEGATIVE red number.
        // They are identical lines at the end of both LIABILITIES and EXPENSES columns
        $this->liabilities[] = $data;
        $this->expenses[] = $data;
    }

    /**
     * @param Data $data
     */
    private function maybeBold(array $data, int $untilDepth): array
    {
        return $data['depth'] <= $untilDepth ? ['font' => ['bold' => true]] : [];
    }

    private function realWrite(): void
    {
        $this->insertProfitOrLoss();

        /*
         * Page 1
         * BALANCE SHEET (Asset vs Liabilities)
         */

        $this->lastDataColumn = $this->showBudget ? 13 : 7;
        $this->column = $initialColumn = 1;

        $this->balanceSheetHeaders($initialColumn);

        // Assets
        $this->column = $initialColumn;
        $initialRow = $this->row;
        $this->lastDataRow = $this->row;
        $this->balanceSheet($initialColumn, $this->assets);

        // Liabilities
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + ($this->showBudget ? 7 : 4);
        $this->balanceSheet($initialColumn, $this->liabilities);

        $this->applyExtraFormatting(6);
        // set printing area for page 1
        $this->sheet->getPageSetup()->setPrintAreaByColumnAndRow(1, 1, $this->lastDataColumn, $this->lastDataRow, 0, 'I');

        /*
         * Page 2
         * INCOME STATEMENT (Profit vs Loss)
         */

        // start at the bottom of the balance sheet
        $this->row = $this->lastDataRow + 1;
        $this->column = $initialColumn = 1;
        $this->incomeStatementHeaders($initialColumn);

        // Expenses
        $initialRow = ++$this->row;
        $this->column = $initialColumn;
        $this->incomeStatement($initialColumn, $this->expenses);

        // Revenues
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + ($this->showBudget ? 7 : 4);
        $this->incomeStatement($initialColumn, $this->revenues);

        $this->row = $this->lastDataRow + 1;
        $this->applyExtraFormatting($initialRow);
        // set printing area for page 2
        $this->sheet->getPageSetup()->setPrintAreaByColumnAndRow(1, $initialRow - 3, $this->lastDataColumn, $this->lastDataRow + 1, 1, 'I');
    }

    private function getProfitOrLoss(bool $isPreviousDate): Money
    {
        // Sum the profit and loss root accounts
        $totalRevenues = $this->sumBalance($this->revenues, $isPreviousDate);

        $totalExpenses = $this->sumBalance($this->expenses, $isPreviousDate);

        return $totalRevenues->subtract($totalExpenses);
    }

    protected function finalize(string $path): void
    {
        // Once we collected all data, we can actually write them all
        $this->realWrite();

        // Print on A4 portrait, scale to full page width, variable height (depending on number of accounts)
        $pageSetup = $this->sheet->getPageSetup();
        $pageSetup->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
        $pageSetup->setPaperSize(PageSetup::PAPERSIZE_A4);
        $pageSetup->setFitToWidth(1);
        $pageSetup->setFitToHeight(0);
        $pageSetup->setHorizontalCentered(true);
        $margins = $this->sheet->getPageMargins();
        $margins->setTop(0.5);
        $margins->setRight(0.2);
        $margins->setLeft(0.2);
        $margins->setBottom(0.5);

        parent::finalize($path);
    }

    protected function writeFooter(): void
    {
        // EXPENSES
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');
        // Account.balance
        $cellsToSum = $this->cellsToSum($this->expenses, 1, 'cellBalance');
        $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
        // Budget columns (optional)
        if ($this->showBudget) {
            $cellsToSum = $this->cellsToSum($this->expenses, 1, 'cellBalancePrevious');
            $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
            $cellsToSum = $this->cellsToSum($this->expenses, 1, 'cellBudgetAllowed');
            $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
            $cellsToSum = $this->cellsToSum($this->expenses, 1, 'cellBudgetBalance');
            $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
        }

        // Margin
        $this->write('');

        // REVENUES
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');
        // Account.balance
        $cellsToSum = $this->cellsToSum($this->revenues, 1, 'cellBalance');
        $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
        // Account previous balance (optional)
        if ($this->showBudget) {
            $cellsToSum = $this->cellsToSum($this->revenues, 1, 'cellBalancePrevious');
            $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
            $cellsToSum = $this->cellsToSum($this->revenues, 1, 'cellBudgetAllowed');
            $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
            $cellsToSum = $this->cellsToSum($this->revenues, 1, 'cellBudgetBalance');
            $this->write($cellsToSum ? '=SUM(' . implode(',', $cellsToSum) . ')' : '', self::$balanceFormat, self::$totalFormat);
        }

        // Apply style
        $range = Coordinate::stringFromColumnIndex($this->firstDataColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->column - 1) . $this->row;
        $this->sheet->getStyle($range)->applyFromArray(self::$totalFormat);
    }

    private function applyExtraFormatting(int $startRow): void
    {
        $columnsToFormat = $this->showBudget ? [3, 4, 5, 6, 10, 11, 12, 13] : [3, 7];
        foreach ($columnsToFormat as $colIndex) {
            // Format balance numbers
            $range = Coordinate::stringFromColumnIndex($colIndex) . $startRow . ':' . Coordinate::stringFromColumnIndex($colIndex) . $this->lastDataRow;
            $this->sheet->getStyle($range)->applyFromArray(self::$balanceFormat);
        }

        // Increase row height since account names can wrap on multiple lines
        for ($r = $startRow; $r <= $this->lastDataRow; ++$r) {
            $this->sheet->getRowDimension($r)->setRowHeight(30);
        }
    }

    private function cellsToSum(array $data, int $depth, string $dataIndex = 'cell'): array
    {
        $equityAccountsClasses = $this->accountingConfig['report']['accountClasses']['equity'];
        $cells = array_reduce($data, function (array $carry, $data) use ($equityAccountsClasses, $depth, $dataIndex) {
            // We only sum accounts at the given depth, plus equity special accounts
            if (isset($data[$dataIndex]) && ($data['depth'] === $depth || in_array(mb_substr((string) $data['code'], 0, 1), $equityAccountsClasses, true))) {
                $carry[] = $data[$dataIndex];
            }

            return $carry;
        }, []);

        return $cells;
    }

    /**
     * Sum root or special accounts balance (for the profit and loss calculation)
     * - Root accounts have depth = 1
     * - Special accounts have code 7xxx, 8xxx, 9xxx.
     *
     * @param Data[] $data profits or expenses
     */
    private function sumBalance(array $data, bool $isPreviousDate): Money
    {
        $sum = array_reduce($data, function (Money $carry, $data) use ($isPreviousDate) {
            if ($data['depth'] === 1 || (int) mb_substr((string) $data['code'], 0, 1) > 6) {
                return $carry->add($isPreviousDate ? $data['balancePrevious'] : $data['balance']);
            }

            return $carry;
        }, Money::CHF(0));

        return $sum;
    }

    private function balanceSheetHeaders(int $initialColumn): void
    {
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + ($this->showBudget ? 12 : 6), $this->row]);
        $this->write(
            _tr('Bilan'),
            self::$titleFormat,
            self::$centerFormat
        );
        $this->sheet->getRowDimension($this->row)->setRowHeight(40);
        ++$this->row;

        // Header line 1
        $headers = [
            ['label' => _tr('Actifs'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->showBudget ? 6 : 3],
            ['label' => '', 'width' => 3, 'formats' => []], // gap
            ['label' => _tr('Passifs'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->showBudget ? 6 : 3],
        ];
        $this->column = $initialColumn;
        $this->writeHeaders($headers);
        ++$this->row;

        // Header line 2: date(s) of balance
        $headers = [
            ['label' => '', 'colspan' => 2], // empty margin
            ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]],
        ];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        $headers[] = ['label' => '', 'formats' => []]; // gap

        $headers[] = ['label' => '', 'colspan' => 2]; // empty margin
        $headers[] = ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }
        $this->column = $initialColumn;
        $this->writeHeaders($headers);
        $this->sheet->getRowDimension($this->row)->setRowHeight(1.2, 'cm');
        ++$this->row;
    }

    /**
     * @param Data[] $allData
     */
    private function balanceSheet(int $initialColumn, array &$allData): void
    {
        // Coordinates (i.e. E3) of the cells with the totals
        $currentTotalCells = '';
        $previousTotalCells = '';
        $budgetAllowedTotalCells = '';
        $budgetBalanceTotalCells = '';
        $firstLine = true;

        foreach ($allData as $index => $data) {
            // Column: account code
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $maybeBold = $this->maybeBold($data, 2);
            if (!$firstLine && $maybeBold) {
                ++$this->row;
            }

            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                self::$indentFormat,
                $maybeBold
            );

            // Column: account name
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], self::$wrappedFormat, $maybeBold);

            // Column: balance at date
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                $currentTotalCells = Coordinate::stringFromColumnIndex($this->column) . $this->row;
            }
            // Store the coordinate of the cell to later compute totals
            $allData[$index]['cellBalance'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat, $maybeBold, $data['format'] ?? []);

            // Budget columns (optional)
            if ($this->showBudget) {
                $allData[$index]['cellBalancePrevious'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                    $previousTotalCells = Coordinate::stringFromColumnIndex($this->column) . $this->row;
                }
                $this->write($data['balancePrevious'] ?? '', self::$balanceFormat, $maybeBold);

                $allData[$index]['cellBudgetAllowed'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                    $budgetAllowedTotalCells = Coordinate::stringFromColumnIndex($this->column) . $this->row;
                }
                $this->write($data['budgetAllowed'] ?? '', self::$balanceFormat, $maybeBold);

                $allData[$index]['cellBudgetBalance'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                    $budgetBalanceTotalCells = Coordinate::stringFromColumnIndex($this->column) . $this->row;
                }
                $this->write($data['budgetBalance'] ?? '', self::$balanceFormat, $maybeBold);
            }

            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }

        // Replace the total value computed from database by a formula computed from the child accounts cells
        // Level 2 (= direct child accounts)
        $cellsToSum = $this->cellsToSum($allData, 2, 'cellBalance');
        if ($cellsToSum) {
            $this->sheet->setCellValue($currentTotalCells, '=SUM(' . implode(',', $cellsToSum) . ')');
        }
        if ($this->showBudget) {
            $cellsToSum = $this->cellsToSum($allData, 2, 'cellBalancePrevious');
            if ($cellsToSum) {
                $this->sheet->setCellValue($previousTotalCells, '=SUM(' . implode(',', $cellsToSum) . ')');
            }
            $cellsToSum = $this->cellsToSum($allData, 2, 'cellBudgetAllowed');
            if ($cellsToSum) {
                $this->sheet->setCellValue($budgetAllowedTotalCells, '=SUM(' . implode(',', $cellsToSum) . ')');
            }
            $cellsToSum = $this->cellsToSum($allData, 2, 'cellBudgetBalance');
            if ($cellsToSum) {
                $this->sheet->setCellValue($budgetBalanceTotalCells, '=SUM(' . implode(',', $cellsToSum) . ')');
            }
        }
    }

    private function incomeStatementHeaders(int $initialColumn): void
    {
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + ($this->showBudget ? 12 : 6), $this->row]);
        $this->write(
            _tr('Compte de résultat'),
            self::$titleFormat,
            self::$centerFormat
        );
        $this->sheet->getRowDimension($this->row)->setRowHeight(40);
        ++$this->row;

        // Header line 1
        $headers = [
            ['label' => _tr('Charges'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->showBudget ? 6 : 3],
            ['label' => '', 'width' => 3, 'formats' => []], // gap
            ['label' => _tr('Profits'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->showBudget ? 6 : 3],
        ];
        $this->column = $initialColumn;
        $this->writeHeaders($headers);
        ++$this->row;

        // Header line 2: date(s) of balance
        $headers = [
            ['label' => '', 'colspan' => 2], // empty margin
            ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]],
        ];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        $headers[] = ['label' => '', 'formats' => []]; // gap

        $headers[] = ['label' => '', 'colspan' => 2]; // empty margin
        $headers[] = ['label' => 'Solde', 'formats' => [self::$headerFormat, self::$centerFormat]];
        if ($this->showBudget) {
            $headers[] = ['label' => 'Solde précédent', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget prévu', 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => 'Budget restant', 'formats' => [self::$headerFormat, self::$centerFormat]];
        }
        $this->column = $initialColumn;
        $this->writeHeaders($headers);
        $this->sheet->getRowDimension($this->row)->setRowHeight(1.2, 'cm');
    }

    /**
     * @param Data[] $allData
     */
    private function incomeStatement(int $initialColumn, array &$allData): void
    {
        $firstLine = true;
        foreach ($allData as $index => $data) {
            // Column: account code
            $maybeBold = $this->maybeBold($data, 1);
            if (!$firstLine && $maybeBold) {
                ++$this->row;
            }

            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                self::$indentFormat,
                $maybeBold
            );

            // Column: account name
            $this->write($data['name'], self::$wrappedFormat, $maybeBold);

            // Column: balance at date
            // Store the coordinate of the cell to later compute totals
            $allData[$index]['cellBalance'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat, $maybeBold, $data['format'] ?? []);

            // Budget columns (optional)
            if ($this->showBudget) {
                $allData[$index]['cellBalancePrevious'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($data['balancePrevious'] ?? '', self::$balanceFormat, $maybeBold);

                $allData[$index]['cellBudgetAllowed'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($data['budgetAllowed'] ?? '', self::$balanceFormat, $maybeBold);

                $allData[$index]['cellBudgetBalance'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($data['budgetBalance'] ?? '', self::$balanceFormat, $maybeBold);
            }

            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
            $firstLine = false;
        }
    }

    private function color(Money $profitOrLoss): array
    {
        return [
            'font' => [
                'color' => [
                    'argb' => $profitOrLoss->isPositive() ? Color::COLOR_DARKGREEN : Color::COLOR_RED,
                ],
            ],
        ];
    }
}
