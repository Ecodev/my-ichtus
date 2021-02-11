<?php

declare(strict_types=1);

namespace Application\Service\Exporter;

use Application\Model\AbstractModel;

abstract class AbstractExporter
{
    private string $exportDir = 'htdocs/data/export/';

    protected string $hostname;

    public function __construct(string $hostname)
    {
        $this->hostname = $hostname;
    }

    abstract protected function getTitleForFilename(): string;

    abstract protected function getExtension(): string;

    /**
     * Initialize the export, possibly writing footer and closing file
     */
    abstract protected function initialize(string $path): void;

    /**
     * Write the items, one per line, in the body part of the sheet
     *
     * @param AbstractModel[] $items
     */
    abstract protected function writeData(array $items): void;

    /**
     * Finalize the export, possibly writing footer and closing file
     */
    abstract protected function finalize(string $path): void;

    /**
     * Called by the field resolver or repository to generate a spreadsheet from the query builder
     *
     * @return string the generated spreadsheet file path
     */
    public function export(array $items): string
    {
        $folder = bin2hex(random_bytes(16)) . '/';
        $dir = $this->exportDir . $folder;
        mkdir($dir);

        $filename = $this->getTitleForFilename() . '.' . $this->getExtension();
        $path = $dir . $filename;

        $this->initialize($path);
        $this->writeData($items);
        $this->finalize($path);

        return 'https://' . $this->hostname . '/data/export/' . $folder . $filename;
    }
}
