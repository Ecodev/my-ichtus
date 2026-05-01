<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Application\Model\IndicatorDefinition;
use Application\Repository\IndicatorDefinitionRepository;
use Ecodev\Felix\Format;
use RuntimeException;

/**
 * @extends AbstractExporter<ReportValue>
 *
 * @phpstan-import-type ReportValue from IndicatorDefinitionRepository
 */
class IndicatorReport extends AbstractExporter
{
    /**
     * @var resource
     */
    private $handle;

    protected function getTitleForFilename(): string
    {
        return _tr('indicateurs_financiers_%date%', ['date' => date('Y-m-d')]);
    }

    protected function getExtension(): string
    {
        return 'csv';
    }

    protected function initialize(string $path): void
    {
        $handle = fopen($path, 'wb');
        if ($handle === false) {
            throw new RuntimeException('Cannot open export file: ' . $path);
        }

        $this->handle = $handle;
        fwrite($this->handle, "\xEF\xBB\xBF");
        $this->writeRow([
            'Indicateur',
            'Valeur',
            'Budget prévu',
            'Budget restant',
            'Comptes',
        ]);
    }

    protected function finalize(string $path): void
    {
        fclose($this->handle);
    }

    protected function writeItem($indicator): void
    {
        $indicatorDefinition = $indicator['indicatorDefinition'];
        $value = $indicator['value'];
        $budgetAllowed = $indicator['budgetAllowed'];
        $budgetBalance = $indicator['budgetBalance'];

        $this->writeRow([
            $indicatorDefinition->getName(),
            Format::money($value),
            Format::money($budgetAllowed),
            Format::money($budgetBalance),
            $this->formatFormula($indicatorDefinition),
        ]);
    }

    /**
     * @param array<int, null|string> $row
     */
    private function writeRow(array $row): void
    {
        fputcsv($this->handle, $row, ',', '"', '');
    }

    private function formatFormula(IndicatorDefinition $indicatorDefinition): string
    {
        $result = [];
        foreach ($indicatorDefinition->getAddends() as $addend) {
            $result[] = '+ ' . $addend->getAccount()->getName() . $this->formatMultiplier($addend->getMultiplier());
        }

        foreach ($indicatorDefinition->getSubtrahends() as $subtrahend) {
            $result[] = '- ' . $subtrahend->getAccount()->getName() . $this->formatMultiplier($subtrahend->getMultiplier());
        }

        return implode(PHP_EOL, $result);
    }

    private function formatMultiplier(int $multiplier): string
    {
        return $multiplier === 100 ? '' : ' (' . $multiplier . '%)';
    }
}
