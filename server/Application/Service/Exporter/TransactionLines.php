<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Application\Model\TransactionLine;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class TransactionLines extends AbstractExcel
{
    public function __construct(string $hostname)
    {
        parent::__construct($hostname);

        $this->sheet->setTitle('Compta Écritures');
    }

    private int $currentTransactionRowStart = 0;

    private ?int $currentTransactionId = null;

    protected function getTitleForFilename(): string
    {
        return 'compta_ecritures_' . date('Y-m-d-H:i:s');
    }

    protected function getHeaders(): array
    {
        return [
            ['label' => 'Date', 'width' => 12, 'formats' => [self::$headerFormat, self::$dateFormat], 'autofilter' => true],
            ['label' => 'ID', 'width' => 7, 'formats' => [self::$headerFormat, self::$centerFormat], 'autofilter' => true],
            ['label' => 'Transaction', 'width' => 25, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Remarques', 'width' => 25, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Remarques internes', 'width' => 25, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Écriture', 'width' => 25, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Remarques', 'width' => 25, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Réservable', 'width' => 30, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Compte débit', 'width' => 30, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Compte crédit', 'width' => 30, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Montant débit', 'width' => 20, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Montant crédit', 'width' => 20, 'formats' => [self::$headerFormat], 'autofilter' => true],
            ['label' => 'Pointé', 'width' => 12, 'formats' => [self::$headerFormat, self::$centerFormat], 'autofilter' => true],
            ['label' => 'Tag', 'width' => 30, 'formats' => [self::$headerFormat], 'autofilter' => true],
        ];
    }

    protected function initialize(string $path): void
    {
        parent::initialize($path);
        $this->writeHeaders($this->getHeaders());
        $this->firstDataRow = ++$this->row;
        $this->column = $this->firstDataColumn;
        $this->sheet->setShowGridlines(false);
    }

    /**
     * @param TransactionLine $line
     */
    protected function writeItem($line): void
    {
        $mergeRowsFromColumns = [
            $this->firstDataColumn + 1, // Transaction.ID
            $this->firstDataColumn + 2, // Transaction.name
            $this->firstDataColumn + 3, // Transaction.remarks
            $this->firstDataColumn + 4, // Transaction.internalRemarks
        ];

        $transaction = $line->getTransaction();
        $transactionId = $transaction->getId();

        if (!$this->currentTransactionId) {
            $this->currentTransactionId = $transactionId;
            $this->currentTransactionRowStart = $this->row;
        } elseif ($transactionId !== $this->currentTransactionId) {
            // Current line starts a new transaction
            if ($this->currentTransactionRowStart < $this->row - 1) {
                // Multi-line transaction
                // Merge cells that have the same value because from the same transaction
                foreach ($mergeRowsFromColumns as $column) {
                    $this->sheet->mergeCells([$column, $this->currentTransactionRowStart, $column, $this->row - 1]);
                }
            }
            $this->currentTransactionRowStart = $this->row;
            $this->currentTransactionId = $transactionId;
        }

        // Date
        $this->write($line->getTransactionDate()->format('d.m.Y'));

        // Transaction.ID
        $this->write($transactionId);
        $url = 'https://' . $this->hostname . '/admin/transaction/%u';
        $this->sheet->getCell([$this->column - 1, $this->row])->getHyperlink()->setUrl(sprintf($url, $transactionId));
        // Transaction.name
        $this->write($transaction->getName());
        // Transaction.remarks
        $this->write($transaction->getRemarks());
        // Transaction.internalRemarks
        $this->write($transaction->getInternalRemarks());

        // TransactionLine.name
        $this->write($line->getName());

        // TransactionLine.remarks
        $this->write($line->getRemarks());
        // Bookable.name
        $bookable = $line->getBookable();
        $this->write($bookable ? $bookable->getName() : '');
        // Debit account
        $debit = $line->getDebit();
        $this->write($debit ? implode(' ', [$debit->getCode(), $debit->getName()]) : '');
        // Credit account
        $credit = $line->getCredit();
        $this->write($credit ? implode(' ', [$credit->getCode(), $credit->getName()]) : '');
        // Debit amount
        $this->write($debit ? $this->moneyFormatter->format($line->getBalance()) : '');
        // Credit amount
        $this->write($credit ? $this->moneyFormatter->format($line->getBalance()) : '');
        // Reconciled
        $this->sheet->getStyle([$this->column, $this->row])->applyFromArray(self::$centerFormat);
        $this->write($line->isReconciled() ? '✔️' : '');
        // Tag
        $tag = $line->getTransactionTag();
        $this->write($tag ? $tag->getName() : '');

        $this->lastDataColumn = $this->column - 1;

        $range = Coordinate::stringFromColumnIndex($this->firstDataColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->lastDataColumn) . $this->row;
        // Thicker horizontal delimiter between lines of different transactions
        $this->sheet->getStyle($range)->applyFromArray(self::$bordersBottomLight);

        $this->column = $this->firstDataColumn;
        ++$this->row;
    }

    protected function writeFooter(): void
    {
        // Date
        $this->write('');
        // ID
        $this->write('');
        // Transaction.name
        $this->write('');
        // Transaction.remarks
        $this->write('');
        // Internal remarks
        $this->write('');
        // TransactionLine.name
        $this->write('');
        // Remarks
        $this->write('');
        // Bookable.name
        $this->write('');
        // Debit account
        $this->write('');
        // Credit account
        $this->write('');
        // Debit amount
        $this->write('=SUBTOTAL(9,' . Coordinate::stringFromColumnIndex($this->column) . '2:' . Coordinate::stringFromColumnIndex($this->column) . ($this->row - 1) . ')');
        // Credit amount
        $this->write('=SUBTOTAL(9,' . Coordinate::stringFromColumnIndex($this->column) . '2:' . Coordinate::stringFromColumnIndex($this->column) . ($this->row - 1) . ')');
        // Reconciled
        $this->write('');

        // Apply style
        $range = Coordinate::stringFromColumnIndex($this->firstDataColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->column - 1) . $this->row;
        $this->sheet->getStyle($range)->applyFromArray(self::$totalFormat);
    }
}
