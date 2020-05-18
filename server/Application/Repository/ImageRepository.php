<?php

declare(strict_types=1);

namespace Application\Repository;

use PDO;

class ImageRepository extends AbstractRepository
{
    /**
     * Returns all unique filename in DB
     *
     * @return string[]
     */
    public function getFilenames(): array
    {
        $filenames = $this->getEntityManager()->getConnection()->createQueryBuilder()
            ->from('image')
            ->select('DISTINCT CONCAT("data/images/", filename)')
            ->where('filename != ""')
            ->orderBy('filename')->execute()->fetchAll(PDO::FETCH_COLUMN);

        return $filenames;
    }

    /**
     * Returns all filename in DB and their id and sizes
     *
     * @return string[]
     */
    public function getFilenamesForDimensionUpdate(): array
    {
        $filenames = $this->getEntityManager()->getConnection()->createQueryBuilder()
            ->from('image')
            ->addSelect('id')
            ->addSelect('width')
            ->addSelect('height')
            ->addSelect('CONCAT("data/images/", filename) AS filename')
            ->where('filename != ""')
            ->orderBy('filename')->execute()->fetchAll();

        return $filenames;
    }
}
