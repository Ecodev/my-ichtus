<?php

declare(strict_types=1);

namespace Application\Repository;

use Application\Model\AbstractModel;
use Doctrine\ORM\EntityRepository;

/**
 * Class AbstractRepository
 *
 * @method null|AbstractModel findOneById(integer $id)
 */
abstract class AbstractRepository extends EntityRepository
{
    use \Ecodev\Felix\Repository\Traits\Repository;
}
