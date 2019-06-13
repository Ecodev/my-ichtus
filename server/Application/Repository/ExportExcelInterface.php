<?php

declare(strict_types=1);

namespace Application\Repository;

use Doctrine\ORM\Query;

/**
 * Interface for repositories which provide an Excel export out of query builder
 */
interface ExportExcelInterface
{
    /**
     * Generates an Excel spreadsheet with the query result
     *
     * @param Query $query
     *
     * @return string name of the temporary file
     */
    public function exportExcel(Query $query): string;
}
