<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\BookableTag;

/**
 * @extends AbstractRepository<BookableTag>
 */
class BookableTagRepository extends AbstractRepository
{
    final public const STORAGE_ID = 6008;
    final public const FORMATION_ID = 6017;
    final public const WELCOME_ID = 6024;
}
