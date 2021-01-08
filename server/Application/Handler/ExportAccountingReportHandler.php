<?php

declare(strict_types=1);

namespace Application\Handler;

use Application\DBAL\Types\AccountTypeType;
use Application\Model\Account;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Cake\Chronos\Date;
use Doctrine\ORM\Query;
use Ecodev\Felix\Format;
use Money\Money;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportAccountingReportHandler extends AbstractExcel
{
    use TestWithTransactionAndUser;

    private array $accountingConfig;

    private Date $date;

    private array $assets = [];

    private array $liabilities = [];

    private array $expenses = [];

    private array $revenues = [];

    private static array

 $balanceFormat = [
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

    private int $lastDataRow;

    public function __construct(string $hostname, array $accountingConfig)
    {
        parent::__construct($hostname, 'accountingReport');

        $this->date = Date::today();
        $this->accountingConfig = $accountingConfig;

        $sheet = $this->workbook->getActiveSheet();
        $sheet->setTitle('Bilan + PP');
        $sheet->getSheetView()->setZoomScale(70);
        $sheet->getDefaultRowDimension()->setRowHeight(20);
    }

    public function setDate(Date $date): void
    {
        $this->date = $date;
    }

    public function getDate(): Date
    {
        return $this->date;
    }

    /**
     * The model class name
     */
    protected function getModelClass(): string
    {
        return Account::class;
    }

    protected function writeTitle(Worksheet $sheet): void
    {
        $this->column = 1;
        $sheet->mergeCellsByColumnAndRow($this->column, $this->row, $this->column + 15, $this->row);
        $this->write($sheet,
            sprintf($this->hostname . ': rapport comptable au %s', $this->getDate()->format('d.m.Y')),
            self::$titleFormat, self::$centerFormat
        );
        $sheet->getRowDimension($this->row)->setRowHeight(35);
        ++$this->row;

        $this->column = 1;
        $sheet->mergeCellsByColumnAndRow($this->column, $this->row, $this->column + 6, $this->row);
        $this->write($sheet,
            sprintf('Bilan'),
            self::$titleFormat, self::$centerFormat
        );
        $this->column = 9;
        $sheet->mergeCellsByColumnAndRow($this->column, $this->row, $this->column + 6, $this->row);
        $this->write($sheet,
            sprintf('Résultat'),
            self::$titleFormat, self::$centerFormat
        );

        $sheet->getRowDimension($this->row)->setRowHeight(35);
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
            if ($account->getType() === AccountTypeType::GROUP && $depth <= $this->accountingConfig['report']['maxAccountDepth']) {
                $children = $account->getChildren()->toArray();
                $this->processAccounts($children, $depth + 1);
            }
        }
    }

    /**
     * @param Account[] $accounts
     */
    protected function writeData(Worksheet $sheet, array $accounts): void
    {
        $this->processAccounts($accounts, 1);

        $sheet->setShowGridlines(false);

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
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $format = ['font' => ['bold' => $data['depth'] <= 2]];
            $this->write(
                $sheet, str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($sheet, $data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->assets[$index]['cell'] = $sheet->getCellByColumnAndRow($this->column, $this->row)->getCoordinate();
            $this->write($sheet, $data['balance'], self::$balanceFormat);

            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;
            if ($this->row > $this->lastDataRow) {
                $this->lastDataRow = $this->row;
            }
        }

        // Liabilities
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + 4;
        $firstLine = true;
        foreach ($this->liabilities as $index => $data) {
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->liabilities[$index]['cell'] = $sheet->getCellByColumnAndRow($this->column, $this->row)->getCoordinate();
            $this->write($sheet, $data['balance'], self::$balanceFormat);
            $format = ['font' => ['bold' => $data['depth'] <= 2]];
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $this->write(
                $sheet, str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($sheet, $data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;
            if ($this->row > $this->lastDataRow) {
                $this->lastDataRow = $this->row;
            }
        }

        // Expenses
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + 4;
        $firstLine = true;
        foreach ($this->expenses as $index => $data) {
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $format = ['font' => ['bold' => $data['depth'] === 1]];
            $this->write(
                $sheet, str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($sheet, $data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->expenses[$index]['cell'] = $sheet->getCellByColumnAndRow($this->column, $this->row)->getCoordinate();
            $this->write($sheet, $data['balance'], self::$balanceFormat);
            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;
            if ($this->row > $this->lastDataRow) {
                $this->lastDataRow = $this->row;
            }
        }

        // Revenues
        $this->row = $initialRow;
        $this->column = $initialColumn = $initialColumn + 4;
        $firstLine = true;
        foreach ($this->revenues as $index => $data) {
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['balance']);
            }
            // Store the coordinate of the cell to later compute totals
            $this->revenues[$index]['cell'] = $sheet->getCellByColumnAndRow($this->column, $this->row)->getCoordinate();
            $this->write($sheet, $data['balance'], self::$balanceFormat);
            $format = ['font' => ['bold' => $data['depth'] === 1]];
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountCode']);
            }
            $this->write(
                $sheet, str_repeat('  ', $data['depth'] - 1) . $data['code'],
                ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1]],
                $format
            );
            if ($firstLine) {
                $sheet->getColumnDimensionByColumn($this->column)->setWidth(self::$columnWidth['accountName']);
            }
            $this->write($sheet, $data['name'], ['alignment' => ['wrapText' => true]], $format, $data['format'] ?? []);
            $firstLine = false;
            ++$this->row;
            $this->column = $initialColumn;
            if ($this->row > $this->lastDataRow) {
                $this->lastDataRow = $this->row;
            }
        }
    }

    protected function getProfitOrLoss(): Money
    {
        // Sum the profit and loss root accounts
        $totalRevenues = array_reduce($this->revenues, function (Money $carry, $data) {
            if ($data['depth'] === 1) {
                return $carry->add($data['balance']);
            }

            return $carry;
        }, Money::CHF(0));

        $totalExpenses = array_reduce($this->expenses, function (Money $carry, $data) {
            if ($data['depth'] === 1) {
                return $carry->add($data['balance']);
            }

            return $carry;
        }, Money::CHF(0));

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

    /**
     * @param Account[] $items
     */
    protected function writeFooter(Worksheet $sheet, array $items): void
    {
        $initialColumn = $this->column;

        /** BALANCE SHEET */

        /** Assets */
        // Account.code
        $this->write($sheet, '');
        // Account.name
        $this->write($sheet, '');
        // Account.balance
        $cellsToSum = array_reduce($this->assets, function (array $carry, $data) {
            if ($data['depth'] === 1 && isset($data['cell'])) {
                $carry[] = $data['cell'];
            }

            return $carry;
        }, []);
        $this->write($sheet, '=SUM(' . implode(',', $cellsToSum) . ')', self::$balanceFormat, self::$totalFormat);

        // Margin
        $this->write($sheet, '');

        /** Liabilities */
        // Account.balance
        $cellsToSum = array_reduce($this->liabilities, function (array $carry, $data) {
            if ($data['depth'] === 1 && isset($data['cell'])) {
                $carry[] = $data['cell'];
            }

            return $carry;
        }, []);
        $this->write($sheet, '=SUM(' . implode(',', $cellsToSum) . ')', self::$balanceFormat, self::$totalFormat);

        // Account.code
        $this->write($sheet, '');
        // Account.name
        $this->write($sheet, '');

        // Margin
        $this->write($sheet, '');

        /** INCOME STATEMENT */

        /** Expenses */
        // Account.code
        $this->write($sheet, '');
        // Account.name
        $this->write($sheet, '');
        // Account.balance
        $cellsToSum = array_reduce($this->expenses, function (array $carry, $data) {
            if ($data['depth'] === 1 && isset($data['cell'])) {
                $carry[] = $data['cell'];
            }

            return $carry;
        }, []);
        $this->write($sheet, '=SUM(' . implode(',', $cellsToSum) . ')', self::$balanceFormat, self::$totalFormat);

        // Margin
        $this->write($sheet, '');

        /** Revenues ** */
        // Account.balance
        $cellsToSum = array_reduce($this->revenues, function (array $carry, $data) {
            if ($data['depth'] === 1 && isset($data['cell'])) {
                $carry[] = $data['cell'];
            }

            return $carry;
        }, []);
        $this->write($sheet, '=SUM(' . implode(',', $cellsToSum) . ')', self::$balanceFormat, self::$totalFormat);
        // Account.code
        $this->write($sheet, '');
        // Account.name
        $this->write($sheet, '');

        // Apply style
        $range = Coordinate::stringFromColumnIndex($initialColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->column - 1) . $this->row;
        $sheet->getStyle($range)->applyFromArray(self::$totalFormat);
    }

    public function generate(Query $query): string
    {
        $this->outputFileName = sprintf('%s_compta_rapport_%s.xlsx', $this->hostname, $this->date->format('Y-m-d'));
        $accounts = $query->getResult();
        $this->workbook->getDefaultStyle()->applyFromArray(self::$defaultFormat);
        $sheet = $this->workbook->getActiveSheet();
        $this->row = 1;
        $this->column = 1;
        $this->writeTitle($sheet);
        $this->column = 1;
        $this->writeHeaders($sheet, $accounts);
        ++$this->row;
        $this->column = 1;
        $this->writeData($sheet, $accounts);

        // Format balance numbers
        foreach ([3, 5, 11, 13] as $colIndex) {
            $range = Coordinate::stringFromColumnIndex($colIndex) . 4 . ':' . Coordinate::stringFromColumnIndex($colIndex) . ($this->lastDataRow);
            $sheet->getStyle($range)->applyFromArray(self::$balanceFormat);
        }

        // Increase row height since account names can wrap on multiple lines
        for ($r = 4; $r <= $this->lastDataRow; ++$r) {
            $sheet->getRowDimension($r)->setRowHeight(30);
        }

        $this->column = 1;
        $this->row = $this->lastDataRow + 1;
        $this->column = 1;
        $this->writeFooter($sheet, $accounts);

        $writer = new Xlsx($this->workbook);

        $tmpFile = bin2hex(random_bytes(16));
        !is_dir($this->tmpDir) && mkdir($this->tmpDir);
        $writer->save($this->tmpDir . '/' . $tmpFile);

        return 'https://' . $this->hostname . '/export/' . $this->routeName . '/' . $tmpFile . '/' . $this->outputFileName;
    }
}
