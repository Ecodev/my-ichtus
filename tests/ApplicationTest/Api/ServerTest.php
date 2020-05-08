<?php

declare(strict_types=1);

namespace ApplicationTest\Api;

use Application\Api\Schema;
use Application\Model\User;
use Ecodev\Felix\Testing\Api\AbstractServer;

class ServerTest extends AbstractServer
{
    protected function setCurrentUser(?string $user): void
    {
        User::setCurrent(_em()->getRepository(User::class)->getOneByLogin($user));
    }

    protected function createSchema(): \GraphQL\Type\Schema
    {
        return new Schema();
    }
}
