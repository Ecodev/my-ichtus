<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\AccountingDocument;
use Application\Model\ExpenseClaim;
use Application\Model\User;
use Application\Repository\AccountingDocumentRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use Money\Money;

class AccountingDocumentRepositoryTest extends AbstractRepositoryTest
{
    use LimitedAccessSubQuery;

    private AccountingDocumentRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(AccountingDocument::class);
    }

    public function providerGetAccessibleSubQuery(): iterable
    {
        $all = [9000, 9001];
        yield ['anonymous', []];
        yield ['bookingonly', []];
        yield ['individual', [9000]];
        yield ['member', [9000]];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }

    public function testFileOnDiskIsDeletedWhenRecordInDbIsDeleted(): void
    {
        $expenseClaim = new ExpenseClaim();
        $document = new AccountingDocument();
        $user = new User();

        $expenseClaim->setOwner($user);
        $expenseClaim->setAmount(Money::CHF(10000));
        $expenseClaim->setName('steaks');
        $document->setExpenseClaim($expenseClaim);
        $document->setFilename('test document.pdf');
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->persist($expenseClaim);
        $this->getEntityManager()->persist($document);
        $this->getEntityManager()->flush();

        $path = $document->getPath();
        touch($path);
        self::assertFileExists($path, 'test file must exist, because we just touch()ed it');

        $this->getEntityManager()->remove($document);
        $this->getEntityManager()->flush();
        self::assertFileDoesNotExist($path, 'test file must have been deleted when record was deleted');
    }
}
