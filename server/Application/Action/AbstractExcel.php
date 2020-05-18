<?php

declare(strict_types=1);

namespace Application\Action;

use Application\Model\AbstractModel;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Query;
use Laminas\Diactoros\Response;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

abstract class AbstractExcel extends AbstractAction
{
    /**
     * Column of current cell we are writing in
     *
     * @var int
     */
    protected $column = 1;

    /**
     * Row of current cell we are writing in
     *
     * @var int
     */
    protected $row = 1;

    /**
     * @var Spreadsheet
     */
    protected $workbook;

    /**
     * @var string
     */
    protected $outputFileName = 'export.xlsx';

    /**
     * @var string
     */
    protected $tmpDir = 'data/tmp/excel';

    /**
     * @var string
     */
    protected $hostname;

    /**
     * @var string
     */
    protected $routeName;

    /**
     * The model class name
     *
     * @return string
     */
    abstract protected function getModelClass();

    protected static $dateFormat = [
        'numberFormat' => ['formatCode' => NumberFormat::FORMAT_DATE_XLSX14],
    ];

    protected static $defaultFormat = [
        'font' => ['size' => 11],
        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
    ];

    protected static $headerFormat = [
        'font' => ['bold' => true, 'color' => ['argb' => 'FFEAEAEA']],
        'alignment' => ['wrapText' => true],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'argb' => 'FF666666',
            ],
        ],
    ];

    protected static $totalFormat = [
        'font' => ['bold' => true],
        'alignment' => ['wrapText' => true],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => [
                'argb' => 'FFDDDDDD',
            ],
        ],
    ];

    protected static $centerFormat = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
    ];

    protected static $rightFormat = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
    ];

    protected static $wrapFormat = [
        'alignment' => ['wrapText' => true],
    ];

    /**
     * Define border cells inside list of data (very light borders)
     *
     * @var array
     */
    protected static $bordersInside = [
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
     * Define border cells for total row (thick border)
     *
     * @var array
     */
    protected static $bordersTotal = [
        'borders' => [
            'outline' => [
                'borderStyle' => Border::BORDER_THICK,
            ],
        ],
    ];

    /**
     * @var array
     */
    protected static $bordersBottom = [
        'borders' => [
            'bottom' => [
                'borderStyle' => Border::BORDER_MEDIUM,
            ],
        ],
    ];

    /**
     * @var array
     */
    protected static $bordersBottomLight = [
        'borders' => [
            'bottom' => [
                'borderStyle' => Border::BORDER_HAIR,
            ],
        ],
    ];

    /**
     * Constructor
     */
    public function __construct(string $hostname, string $routeName)
    {
        $this->hostname = $hostname;
        $this->routeName = $routeName;
        $this->workbook = new Spreadsheet();
        $this->workbook->setActiveSheetIndex(0);
    }

    /**
     * @param AbstractModel[] $items
     */
    protected function writeHeaders(Worksheet $sheet, array $items): void
    {
        $initialColumn = $this->column;

        // Headers
        foreach ($this->getHeaders() as $header) {
            // Apply width
            if (isset($header['width'])) {
                $colDimension = $sheet->getColumnDimensionByColumn($this->column);
                if ($header['width'] === 'auto') {
                    $colDimension->setAutoSize(true);
                } else {
                    $colDimension->setWidth($header['width']);
                }
            }
            // Apply format
            if (!isset($header['formats'])) {
                $header['formats'] = [];
            }
            $header['formats'] = [-1 => self::$headerFormat] + $header['formats'];

            $this->write($sheet, $header['label'], ...$header['formats']);
        }

        // Apply AutoFilters
        $sheet->setAutoFilterByColumnAndRow($initialColumn, $this->row, $this->column - 1, $this->row + count($items));
    }

    /**
     * Write the items, one per line, in the body part of the sheet
     *
     * @param AbstractModel[] $items
     */
    abstract protected function writeData(Worksheet $sheet, array $items): void;

    /**
     * Write the footer line
     *
     * @param AbstractModel[] $items
     */
    abstract protected function writeFooter(Worksheet $sheet, array $items): void;

    abstract protected function getHeaders(): array;

    /**
     * Write the value and style in the cell selected by `column` and `row` variables and move to next column
     *
     * @param mixed $value
     * @param array[] ...$formats optional list of formats to be applied successively
     */
    protected function write(Worksheet $sheet, $value, array ...$formats): void
    {
        $cell = $sheet->getCellByColumnAndRow($this->column++, $this->row);
        if ($formats) {
            $style = $cell->getStyle();
            foreach ($formats as $format) {
                $style->applyFromArray($format);
            }
        }

        // Automatic conversion of date to Excel format
        if ($value instanceof DateTimeInterface) {
            $dateTime = new DateTimeImmutable($value->format('c'));
            $value = Date::PHPToExcel($dateTime);
        }

        $cell->setValue($value);
    }

    /**
     * Called by the field resolver or repository to generate a spreadsheet from the query builder
     *
     * @return string the generated spreadsheet file path
     */
    public function generate(Query $query): string
    {
        $items = $query->getResult();

        $this->workbook->getDefaultStyle()->applyFromArray(self::$defaultFormat);
        $sheet = $this->workbook->getActiveSheet();
        $this->row = 1;
        $this->column = 1;
        $this->writeHeaders($sheet, $items);
        ++$this->row;
        $this->column = 1;
        $this->writeData($sheet, $items);
        $this->column = 1;
        $this->writeFooter($sheet, $items);

        $writer = new Xlsx($this->workbook);

        $tmpFile = bin2hex(random_bytes(16));
        @mkdir($this->tmpDir);
        $writer->save($this->tmpDir . '/' . $tmpFile);

        return 'https://' . $this->hostname . '/export/' . $this->routeName . '/' . $tmpFile . '/' . $this->outputFileName;
    }

    /**
     * Process the GET query to download previously generated spreasheet on disk
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Read file from disk
        $tmpFile = $this->tmpDir . '/' . $request->getAttribute('key');

        if (!file_exists($tmpFile)) {
            return new Response\EmptyResponse(404);
        }

        $size = filesize($tmpFile);
        $output = fopen($tmpFile, 'rb');

        $response = new Response($output, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => sprintf('attachment; filename=%s', $request->getAttribute('name')),
            'Access-Control-Expose-Headers' => 'Content-Disposition',
            'Expire' => 0,
            'Pragma' => 'public',
            'Content-Length' => $size,
        ]);

        return $response;
    }
}
