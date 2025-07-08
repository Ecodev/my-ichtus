<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

/**
 * @template T of \Application\Model\AbstractModel|array
 */
abstract class AbstractExporter
{
    private string $exportDir = 'htdocs/data/export/';

    public function __construct(
        protected string $hostname,
    ) {}

    abstract protected function getTitleForFilename(): string;

    abstract protected function getExtension(): string;

    /**
     * Initialize the export, possibly writing footer and closing file.
     */
    abstract protected function initialize(string $path): void;

    /**
     * Write the item, one per line, in the body part of the sheet.
     *
     * @param T $item
     */
    abstract protected function writeItem($item): void;

    /**
     * Finalize the export, possibly writing footer and closing file.
     */
    abstract protected function finalize(string $path): void;

    /**
     * Called by the field resolver or repository to generate a spreadsheet from the query builder.
     *
     * @param iterable<T> $items
     *
     * @return string the generated spreadsheet file path
     */
    public function export(iterable $items): string
    {
        $folder = bin2hex(random_bytes(16)) . '/';
        $dir = $this->exportDir . $folder;
        mkdir($dir);

        $filename = $this->getTitleForFilename() . '.' . $this->getExtension();
        $path = $dir . $filename;

        $this->initialize($path);

        foreach ($items as $item) {
            $this->writeItem($item);
        }

        $this->finalize($path);

        return 'https://' . $this->hostname . '/data/export/' . $folder . $filename;
    }
}
