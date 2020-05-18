<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\Message;
use Application\Repository\MessageRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;

class MessageRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    /**
     * @var MessageRepository
     */
    private $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Message::class);
    }

    public function providerGetAccessibleSubQuery(): array
    {
        // Nobody can see all messages for now, even administrator, because it's useless
        $all = [11001, 11002];

        return [
            ['anonymous', []],
            ['bookingonly', []],
            ['individual', []],
            ['member', [11001]],
            ['responsible', []],
            ['administrator', []],
        ];
    }
}
