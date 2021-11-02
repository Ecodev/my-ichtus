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

    /**
     * @param TransactionLine[] $items
     */
    protected function writeData(array $items): void
    {
        $this->sheet->setShowGridlines(false);
        $initialColumn = $this->column;
        $currentTransactionRowStart = null;
        $currentTransactionId = null;

        $mergeRowsFromColumns = [
            $initialColumn + 1, // Transaction.ID
            $initialColumn + 2, // Transaction.name
            $initialColumn + 3, // Transaction.remarks
            $initialColumn + 4, // Transaction.internalRemarks
        ];

        foreach ($items as $index => $line) {
            $transaction = $line->getTransaction();
            $transactionId = $transaction->getId();

            if (!$currentTransactionId) {
                $currentTransactionId = $transactionId;
                $currentTransactionRowStart = $this->row;
            } elseif ($transactionId !== $currentTransactionId) {
                // Current line starts a new transaction
                if ($currentTransactionRowStart < $this->row - 1) {
                    // Multi-line transaction
                    // Merge cells that have the same value because from the same transaction
                    foreach ($mergeRowsFromColumns as $column) {
                        $this->sheet->mergeCellsByColumnAndRow($column, $currentTransactionRowStart, $column, $this->row - 1);
                    }
                }
                $currentTransactionRowStart = $this->row;
                $currentTransactionId = $transactionId;
            }

            // Date
            $this->write($line->getTransactionDate()->format('d.m.Y'));

            // Transaction.ID
            $this->write($transactionId);
            $url = 'https://' . $this->hostname . '/admin/transaction/%u';
            $this->sheet->getCellByColumnAndRow($this->column - 1, $this->row)->getHyperlink()->setUrl(sprintf($url, $transactionId));
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
            $this->sheet->getStyleByColumnAndRow($this->column, $this->row)->applyFromArray(self::$centerFormat);
            $this->write($line->isReconciled() ? '✔️' : '');
            // Tag
            $tag = $line->getTransactionTag();
            $this->write($tag ? $tag->getName() : '');

            $this->lastDataColumn = $this->column - 1;

            $range = Coordinate::stringFromColumnIndex($initialColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->lastDataColumn) . $this->row;
            // Thicker horizontal delimiter between lines of different transactions
            if ($index === max(array_keys($items)) || $line->getTransaction()->getId() !== $items[$index + 1]->getTransaction()->getId()) {
                $borderBottom = self::$bordersBottom;
            } else {
                $borderBottom = self::$bordersBottomLight;
            }
            $this->sheet->getStyle($range)->applyFromArray($borderBottom);

            $this->column = $initialColumn;
            ++$this->row;
        }
        $this->lastDataRow = $this->row - 1;
    }

    protected function writeFooter(): void
    {
        $initialColumn = $this->column;

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
        $range = Coordinate::stringFromColumnIndex($initialColumn) . $this->row . ':' . Coordinate::stringFromColumnIndex($this->column - 1) . $this->row;
        $this->sheet->getStyle($range)->applyFromArray(self::$totalFormat);
    }
}
