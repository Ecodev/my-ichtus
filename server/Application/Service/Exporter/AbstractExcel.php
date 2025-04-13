<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Cake\Chronos\ChronosDate;
use DateTimeImmutable;
use DateTimeInterface;
use Money\Currencies\ISOCurrencies;
use Money\Formatter\DecimalMoneyFormatter;
use Money\Money;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * @template T of \Application\Model\AbstractModel|array
 *
 * @extends AbstractExporter<T>
 */
abstract class AbstractExcel extends AbstractExporter
{
    /**
     * Zebra striping of data rows.
     */
    protected bool $zebra = true;

    /**
     * Enable auto filter on the headers.
     */
    protected bool $autoFilter = true;

    /**
     * Column of current cell we are writing in.
     */
    protected int $column = 1;

    /**
     * Row of current cell we are writing in.
     */
    protected int $row = 1;

    /**
     * Index of first column containing data.
     */
    protected int $firstDataColumn = 1;

    /**
     * Index of first row containing data.
     */
    protected int $firstDataRow = 1;

    /**
     * Index of last column containing data.
     */
    protected int $lastDataColumn = 1;

    /**
     * Index of last row containing data.
     */
    protected int $lastDataRow = 1;

    private readonly Spreadsheet $workbook;

    protected Worksheet $sheet;

    protected DecimalMoneyFormatter $moneyFormatter;

    protected static array $dateFormat = [
        'numberFormat' => ['formatCode' => NumberFormat::FORMAT_DATE_XLSX14],
    ];

    protected static array $defaultFormat = [
        'font' => ['size' => 11],
        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
    ];

    protected static array $titleFormat = [
        'font' => ['size' => 14],
    ];

    protected static array $headerFormat = [
        'font' => ['bold' => true, 'color' => ['argb' => 'FFEAEAEA']],
        'alignment' => ['wrapText' => true],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'argb' => 'FF666666',
            ],
        ],
    ];

    protected static array $zebraFormat = [
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'argb' => 'FFE6E6E6',
            ],
            'endColor' => [
                'argb' => 'FFE6E6E6',
            ],
        ],
    ];

    protected static array $totalFormat = [
        'font' => ['bold' => true],
        'alignment' => ['wrapText' => true],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'argb' => 'FFDDDDDD',
            ],
        ],
    ];

    protected static array $centerFormat = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
    ];

    protected static array $rightFormat = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
    ];

    protected static array $leftFormat = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
    ];

    protected static array $wrapFormat = [
        'alignment' => ['wrapText' => true],
    ];

    protected static array $inactiveFormat = [
        'font' => ['color' => ['argb' => 'FFC0C0C0']],
    ];

    /**
     * Define border cells inside list of data (very light borders).
     */
    protected static array $bordersInside = [
        'borders' => [
            'inside' => [
                'borderStyle' => Border::BORDER_HAIR,
            ],
            'outline' => [
                'borderStyle' => Border::BORDER_MEDIUM,
            ],
        ],
    ];

    /**
     * Define border cells for total row (thick border).
     */
    protected static array $bordersTotal = [
        'borders' => [
            'outline' => [
                'borderStyle' => Border::BORDER_THICK,
            ],
        ],
    ];

    protected static array $bordersBottom = [
        'borders' => [
            'bottom' => [
                'borderStyle' => Border::BORDER_MEDIUM,
            ],
        ],
    ];

    protected static array $bordersBottomLight = [
        'borders' => [
            'bottom' => [
                'borderStyle' => Border::BORDER_HAIR,
            ],
        ],
    ];

    public function __construct(string $hostname)
    {
        parent::__construct($hostname);
        $currencies = new ISOCurrencies();
        $this->moneyFormatter = new DecimalMoneyFormatter($currencies);
        $this->workbook = new Spreadsheet();
        $this->sheet = $this->workbook->getActiveSheet();

        $this->sheet->getDefaultRowDimension()->setRowHeight(20);
    }

    protected function writeTitle(): void
    {
    }

    protected function writeFooter(): void
    {
    }

    public function writeHeaders(array $headers): void
    {
        // Headers
        foreach ($headers as $header) {
            // Apply width
            if (isset($header['width'])) {
                $colDimension = $this->sheet->getColumnDimensionByColumn($this->column);
                if ($header['width'] === 'auto') {
                    $colDimension->setAutoSize(true);
                } else {
                    $colDimension->setWidth($header['width']);
                }
            }
            // Apply default format
            if (!isset($header['formats'])) {
                $header['formats'] = [self::$headerFormat];
            }

            if (isset($header['colspan']) && $header['colspan'] > 1) {
                $this->sheet->mergeCells([$this->column, $this->row, $this->column + (int) $header['colspan'] - 1, $this->row]);
            }

            $this->write($header['label'], ...$header['formats']);

            if (isset($header['colspan']) && $header['colspan'] > 1) {
                $this->column += (int) $header['colspan'] - 1;
            }
        }
    }

    /**
     * Write the value and style in the cell selected by `column` and `row` variables and move to next column.
     *
     * @param mixed $value
     * @param array[] ...$formats optional list of formats to be applied successively
     */
    protected function write($value, array ...$formats): void
    {
        $cell = $this->sheet->getCell([$this->column++, $this->row]);
        if ($formats) {
            $style = $cell->getStyle();
            foreach ($formats as $format) {
                $style->applyFromArray($format);
            }
        }

        // Automatic conversion of date to Excel format
        if ($value instanceof DateTimeInterface || $value instanceof ChronosDate) {
            $dateTime = new DateTimeImmutable($value->format('c'));
            $value = Date::PHPToExcel($dateTime);
        } elseif ($value instanceof Money) {
            $value = $this->moneyFormatter->format($value);
        }

        $cell->setValue($value);
    }

    protected function initialize(string $path): void
    {
        $this->workbook->getDefaultStyle()->applyFromArray(self::$defaultFormat);
        $this->row = 1;
        $this->column = 1;
        $this->writeTitle();
        $this->column = 1;
        $this->firstDataRow = $this->row;
        $this->firstDataColumn = $this->column;
    }

    protected function finalize(string $path): void
    {
        $this->lastDataRow = $this->row - 1;

        $this->applyZebra();
        $this->applyAutoFilter();

        $this->column = 1;
        $this->row = $this->lastDataRow + 1;
        $this->writeFooter();

        $writer = new Xlsx($this->workbook);
        $writer->save($path);
    }

    protected function getExtension(): string
    {
        return 'xlsx';
    }

    private function applyZebra(): void
    {
        if (!$this->zebra) {
            return;
        }

        $zebraRange = Coordinate::stringFromColumnIndex($this->firstDataColumn) . $this->firstDataRow . ':' . Coordinate::stringFromColumnIndex($this->lastDataColumn) . $this->lastDataRow;
        $zebraCondition = new Conditional();
        $zebraCondition->setConditionType(Conditional::CONDITION_EXPRESSION)->setOperatorType(Conditional::OPERATOR_EQUAL)->addCondition('MOD(ROW(),2)=0');
        $zebraCondition->getStyle()->applyFromArray(self::$zebraFormat);
        $this->sheet->getStyle($zebraRange)->setConditionalStyles([$zebraCondition]);
    }

    private function applyAutoFilter(): void
    {
        if ($this->autoFilter) {
            $this->sheet->setAutoFilter([$this->firstDataColumn, $this->firstDataRow - 1, $this->lastDataColumn, $this->lastDataRow]);
        }
    }
}
