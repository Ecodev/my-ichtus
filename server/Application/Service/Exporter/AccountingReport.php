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

class AccountingReport extends AbstractExcel
{
    private ChronosDate $date;

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

        // Assets
        $this->column = $initialColumn = 1;
        $initialRow = $this->row;
        $firstLine = true;
        $this->lastDataRow = $this->row;
        foreach ($this->assets as $index => $data) {
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $format = ['font' => ['bold' => $data['depth'] <= 2]];
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->assets[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat);

            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }

        // Liabilities
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + 4;
        $firstLine = true;
        foreach ($this->liabilities as $index => $data) {
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->liabilities[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat);
            $format = ['font' => ['bold' => $data['depth'] <= 2]];
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }

        // Expenses
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + 4;
        $firstLine = true;
        foreach ($this->expenses as $index => $data) {
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $format = ['font' => ['bold' => $data['depth'] === 1]];
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->expenses[$index]['cell'] = $this->sheet->getCell([$this->column, $this->row])->getCoordinate();
            $this->write($data['balance'], self::$balanceFormat);
            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }

        // Revenues
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + 4;
        $firstLine = true;
        foreach ($this->revenues as $index => $data) {
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
            $this->write(
                str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $this->sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;

            $this->lastDataRow = max($this->lastDataRow, $this->row);
        }

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

        $headers[] = ['label' => 'Actifs', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 3];
        $headers[] = ['label' => '', 'width' => 3, 'formats' => []]; // margin
        $headers[] = ['label' => 'Passifs', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 3];

        $headers[] = ['label' => '', 'width' => 5, 'formats' => []]; // margin

        $headers[] = ['label' => 'Charges', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 3];
        $headers[] = ['label' => '', 'width' => 3, 'formats' => []]; // margin
        $headers[] = ['label' => 'Profits', 'formats' => [self::$headerFormat, self::$centerFormat], 'colspan' => 3];

        return $headers;
    }

    protected function writeFooter(): void
    {
        $initialColumn = $this->column;

        // BALANCE SHEET

        // Assets
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');
        // Account.balance
        $this->writeSum($this->assets);

        // Margin
        $this->write('');

        // Liabilities
        // Account.balance
        $this->writeSum($this->liabilities);

        // Account.code
        $this->write('');
        // Account.name
        $this->write('');

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

        // Margin
        $this->write('');

        // Revenues
        // Account.balance
        $this->writeSum($this->revenues);
        // Account.code
        $this->write('');
        // Account.name
        $this->write('');

        // Apply style
        $range = Coordinate::stringFromColumnIndex($initialColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->column - 1) . $this->row;
        $this->sheet->getStyle($range)->applyFromArray(self::$totalFormat);
    }

    private function applyExtraFormatting(): void
    {
        // Format balance numbers
        foreach ([3, 5, 11, 13] as $colIndex) {
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
