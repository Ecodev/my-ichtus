<?php

declare(strict_types=1);

namespace ApplicationTest\Api;

use Application\Api\Schema;
use Application\Model\User;
use Application\Repository\UserRepository;
use Ecodev\Felix\Testing\Api\AbstractServer;

class ServerTest extends AbstractServer
{
    protected function setCurrentUser(?string $login): void
    {
        $user = null;
        if ($login && $login !== 'anonymous') {
            /** @var UserRepository $userRepository */
            $userRepository = $this->getEntityManager()->getRepository(User::class);
            $user = $userRepository->getOneByLoginOrEmail($login);
            self::assertNotNull($user, 'given login must exist in test DB: ' . $login);
        }

        User::setCurrent($user);
    }

    protected function createSchema(): \GraphQL\Type\Schema
    {
        return new Schema();
    }
}
