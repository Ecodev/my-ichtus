<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Application\Enum\AccountType;
use Application\Repository\AccountRepository;
use Cake\Chronos\ChronosDate;
use Money\Money;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

/**
 * @extends AbstractExcel<AccountForReport>
 *
 * @phpstan-import-type AccountForReport from AccountRepository
 *
 * @phpstan-type ProfitOrLoss array{
 *      code:  '',
 *      name: string,
 *      depth: 1,
 *      balance: int,
 *      previousBalance: null | int,
 *      previousFormat: null | array,
 *      budget_allowed: null,
 *      budget_balance: null,
 *      format: array,
 *  }
 * @phpstan-type Data AccountForReport|ProfitOrLoss
 */
class AccountingReport extends AbstractExcel
{
    private ChronosDate $date;

    private bool $showBudget = false;

    private ?ChronosDate $datePrevious = null;

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

    protected static array $ctrlFormat = [
        'font' => [
            'color' => [
                'bold' => false,
                'argb' => 'FF606060',
            ],
        ],
        'alignment' => ['wrapText' => true],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'argb' => 'FFDDDDDD',
            ],
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

    /**
     * @var array<string, int>
     */
    private static array $columnWidth = [
        'accountCode' => 11,
        'accountName' => 38,
        'balance' => 12,
    ];

    public function __construct(string $hostname)
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

    public function setDatePrevious(?ChronosDate $datePrevious): void
    {
        $this->datePrevious = $datePrevious;
    }

    public function showBudget(bool $showBudget): void
    {
        $this->showBudget = $showBudget;
    }

    protected function writeTitle(): void
    {
        $this->column = 1;
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + $this->getColspan(), $this->row]);
        $this->write(
            sprintf($this->hostname . ': rapport comptable au %s', $this->date->format('d.m.Y')),
            self::$titleFormat,
            self::$centerFormat,
        );
        $this->sheet->getRowDimension($this->row)->setRowHeight(35);
        ++$this->row;
    }

    /**
     * @param AccountForReport $account
     */
    protected function writeItem($account): void
    {
        // This is unusual because we don't write anything but only collect data for later
        if ($account['type'] === AccountType::Asset->value) {
            $this->assets[] = $account;
        } elseif ($account['type'] === AccountType::Liability->value) {
            $this->liabilities[] = $account;
        } elseif ($account['type'] === AccountType::Revenue->value) {
            $this->revenues[] = $account;
        } elseif ($account['type'] === AccountType::Expense->value) {
            $this->expenses[] = $account;
        }
    }

    /**
     * Compute the profit or loss (at current and previous dates) and insert the result into the list of accounts.
     */
    private function insertProfitOrLoss(): void
    {
        $profitOrLoss = $this->getProfitOrLoss('balance');

        if ($profitOrLoss === 0) {
            return; // If financial result is balanced, it likely a final accounting report so we don't show the intermediate result
        }

        $data = [
            'depth' => 1,
            'code' => '',
            'name' => _tr('Résultat intermédiaire (bénéfice / -perte)'),
            'balance' => $profitOrLoss, // can be positive of negative
            'previousBalance' => null,
            'previousFormat' => null,
            'budget_allowed' => null,
            'budget_balance' => null,
            'format' => $this->color($profitOrLoss),
        ];

        if ($this->datePrevious) {
            $profitOrLossPrevious = $this->getProfitOrLoss('previousBalance');
            $data['previousBalance'] = $profitOrLossPrevious;
            $data['previousFormat'] = $this->color($profitOrLossPrevious);
        }

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

        $this->lastDataColumn = 1 + $this->getColspan();
        $this->column = $initialColumn = 1;

        $this->balanceSheetHeaders($initialColumn);

        // Assets
        $this->column = $initialColumn;
        $initialRow = $this->row;
        $this->lastDataRow = $this->row;
        $this->balanceSheet($initialColumn, $this->assets);

        // Liabilities
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + $this->getColspan() / 2 + 1;
        $this->balanceSheet($initialColumn, $this->liabilities);

        $this->row = $this->lastDataRow + 1;
        $this->writeTotals($this->assets, $this->liabilities);

        $this->applyExtraFormatting(5);
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
        $this->column = $initialColumn = $initialColumn + $this->getColspan() / 2 + 1;
        $this->incomeStatement($initialColumn, $this->revenues);

        $this->row = $this->lastDataRow + 1;
        $this->writeTotals($this->expenses, $this->revenues);

        $this->applyExtraFormatting($initialRow);
        // set printing area for page 2
        $this->sheet->getPageSetup()->setPrintAreaByColumnAndRow(1, $initialRow - 3, $this->lastDataColumn, $this->lastDataRow + 1, 1, 'I');
    }

    private function getProfitOrLoss(string $attribute): int
    {
        // Sum the profit and loss root accounts
        $totalRevenues = $this->sumRoot($this->revenues, $attribute);
        $totalExpenses = $this->sumRoot($this->expenses, $attribute);

        return $totalRevenues - $totalExpenses;
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

    // Insert a row with the control totals
    protected function writeTotals(array $accountsColumn1, array $accountsColumn2): void
    {
        $this->column = $this->firstDataColumn;
        foreach ([$accountsColumn1, $accountsColumn2] as $col => $accounts) {
            // Account.code
            $this->write(mb_strtoupper(_tr('Contrôle')));

            // Account.name
            $this->write('');

            // Account.balance
            $this->write($this->toMoney($this->sumRoot($accounts, 'balance')), self::$balanceFormat, self::$totalFormat);

            // Account previous balance (optional)
            if ($this->datePrevious) {
                $this->write($this->toMoney($this->sumRoot($accounts, 'previousBalance')), self::$balanceFormat, self::$totalFormat);
            }

            // Budget columns (optional)
            if ($this->showBudget) {
                $this->column += 2;
            }
            if ($col === 0) {
                // Inner columns gap
                $this->write('');
            }
        }
        $this->lastDataRow = $this->row;

        // Apply style
        $range = Coordinate::stringFromColumnIndex($this->firstDataColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->column - 1) . $this->row;
        $this->sheet->getStyle($range)->applyFromArray(self::$ctrlFormat);
    }

    private function applyExtraFormatting(int $startRow): void
    {
        if ($this->datePrevious && !$this->showBudget) {
            $columnsToFormat = [3, 4, 8, 9];
        } elseif (!$this->datePrevious && $this->showBudget) {
            $columnsToFormat = [3, 4, 5, 9, 10, 11];
        } elseif ($this->datePrevious && $this->showBudget) {
            $columnsToFormat = [3, 4, 5, 6, 10, 11, 12, 13];
        } else {
            // Only current balance cols
            $columnsToFormat = [3, 7];
        }
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

    /**
     * Sum root or equity accounts balance (for the profit and loss calculation)
     * - Root accounts have depth = 1.
     *
     * @param Data[] $data profits or expenses
     */
    private function sumRoot(array $data, string $attribute): int
    {
        $rootAccounts = array_filter($data, fn ($account) => !isset($account['parent_id']));

        return array_sum(array_column($rootAccounts, $attribute));
    }

    private function balanceSheetHeaders(int $initialColumn): void
    {
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + $this->getColspan(), $this->row]);
        $this->write(
            _tr('Bilan'),
            self::$titleFormat,
            self::$centerFormat,
        );
        $this->sheet->getRowDimension($this->row)->setRowHeight(40);
        ++$this->row;

        // Header line 1
        $headers = [
            ['label' => _tr('Actifs'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->getColspan() / 2],
            ['label' => '', 'width' => 3, 'formats' => []], // gap
            ['label' => _tr('Passifs'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->getColspan() / 2],
        ];
        $this->column = $initialColumn;
        $this->writeHeaders($headers);
        ++$this->row;

        // Header line 2: date(s) of balance
        $headers = [
            ['label' => '', 'colspan' => 2], // empty margin
            ['label' => $this->date->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]], // current date
        ];
        if ($this->datePrevious) {
            $headers[] = ['label' => $this->datePrevious->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]]; // previous date
        }
        if ($this->showBudget) {
            $headers[] = ['label' => _tr('Budget prévu'), 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => _tr('Budget restant'), 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        $headers[] = ['label' => '', 'formats' => []]; // gap
        $headers[] = ['label' => '', 'colspan' => 2]; // empty margin
        $headers[] = ['label' => $this->date->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]]; // current date
        if ($this->datePrevious) {
            $headers[] = ['label' => $this->datePrevious->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]]; // previous date
        }
        if ($this->showBudget) {
            $headers[] = ['label' => _tr('Budget prévu'), 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => _tr('Budget restant'), 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        $this->column = $initialColumn;
        $this->writeHeaders($headers);
        ++$this->row;
    }

    /**
     * @param Data[] $allData
     */
    private function balanceSheet(int $initialColumn, array &$allData): void
    {
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
                $maybeBold,
            );

            // Column: account name
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], self::$wrappedFormat, $maybeBold);

            // Column: balance at date
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $allData[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($this->toMoney($data['balance']), self::$balanceFormat, $maybeBold, $data['format'] ?? []);

            // Column: balance at previous date (optional)
            if ($this->datePrevious) {
                $allData[$index]['cellPrevious'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                }
                $this->write($this->toMoney($data['previousBalance']), $maybeBold, $data['previousFormat'] ?? []);
            }

            // Budget columns (optional)
            if ($this->showBudget) {
                $allData[$index]['cellBudgetAllowed'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                }
                $this->write($this->toMoney($data['budget_allowed'], true), self::$balanceFormat, $maybeBold);

                $allData[$index]['cellBudgetBalance'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                if ($firstLine) {
                    $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
                }
                $this->write($this->toMoney($data['budget_balance'], true), self::$balanceFormat, $maybeBold);
            }

            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }
    }

    private function getColspan(): int
    {
        $colspan = 6;
        if ($this->datePrevious) {
            $colspan += 2;
        }
        if ($this->showBudget) {
            $colspan += 4;
        }

        return $colspan;
    }

    private function incomeStatementHeaders(int $initialColumn): void
    {
        $this->sheet->mergeCells([$this->column, $this->row, $this->column + $this->getColspan(), $this->row]);
        $this->write(
            _tr('Compte de résultat'),
            self::$titleFormat,
            self::$centerFormat,
        );
        $this->sheet->getRowDimension($this->row)->setRowHeight(40);
        ++$this->row;

        // Header line 1
        $headers = [
            ['label' => _tr('Charges'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->getColspan() / 2],
            ['label' => '', 'width' => 3, 'formats' => []], // gap
            ['label' => _tr('Profits'), 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => $this->getColspan() / 2],
        ];
        $this->column = $initialColumn;
        $this->writeHeaders($headers);
        ++$this->row;

        // Header line 2: date(s) of balance
        $headers = [
            ['label' => '', 'colspan' => 2], // empty margin
            ['label' => $this->date->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]], // current date
        ];
        if ($this->datePrevious) {
            $headers[] = ['label' => $this->datePrevious->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]]; // previous date
        }
        if ($this->showBudget) {
            $headers[] = ['label' => _tr('Budget prévu'), 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => _tr('Budget restant'), 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        $headers[] = ['label' => '', 'formats' => []]; // gap
        $headers[] = ['label' => '', 'colspan' => 2]; // empty margin
        $headers[] = ['label' => $this->date->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]]; // current date
        if ($this->datePrevious) {
            $headers[] = ['label' => $this->datePrevious->format('d.m.Y'), 'formats' => [self::$headerFormat, self::$centerFormat]]; // previous date
        }
        if ($this->showBudget) {
            $headers[] = ['label' => _tr('Budget prévu'), 'formats' => [self::$headerFormat, self::$centerFormat]];
            $headers[] = ['label' => _tr('Budget restant'), 'formats' => [self::$headerFormat, self::$centerFormat]];
        }

        $this->column = $initialColumn;
        $this->writeHeaders($headers);
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
                $maybeBold,
            );

            // Column: account name
            $this->write($data['name'], self::$wrappedFormat, $maybeBold);

            // Column: balance at date
            // Store the coordinate of the cell to later compute totals
            $allData[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($this->toMoney($data['balance']), self::$balanceFormat, $maybeBold, $data['format'] ?? []);

            // Column: balance at previous date (optional)
            if ($this->datePrevious) {
                $allData[$index]['cellPrevious'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($this->toMoney($data['previousBalance']), $maybeBold, $data['previousFormat'] ?? []);
            }

            // Budget columns (optional)
            if ($this->showBudget) {
                $allData[$index]['cellBudgetAllowed'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($this->toMoney($data['budget_allowed'], true), self::$balanceFormat, $maybeBold);

                $allData[$index]['cellBudgetBalance'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
                $this->write($this->toMoney($data['budget_balance'], true), self::$balanceFormat, $maybeBold);
            }

            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
            $firstLine = false;
        }
    }

    /**
     * @param null|int|numeric-string $value
     */
    private function toMoney(int|string|null $value, bool $empty = false): Money|string
    {
        if ($value === null) {
            return $empty ? '' : Money::CHF(0);
        }

        return Money::CHF($value);
    }

    private function color(int $profitOrLoss): array
    {
        return [
            'font' => [
                'color' => [
                    'argb' => $profitOrLoss > 0 ? Color::COLOR_DARKGREEN : Color::COLOR_RED,
                ],
            ],
        ];
    }
}
