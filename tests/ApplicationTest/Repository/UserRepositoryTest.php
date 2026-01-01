<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\User;
use Application\Repository\UserRepository;
use ApplicationTest\Traits\LimitedAccessSubQuery;
use PHPUnit\Framework\Attributes\DataProvider;

class UserRepositoryTest extends AbstractRepository
{
    use LimitedAccessSubQuery;

    private UserRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(User::class);
    }

    public static function providerGetAccessibleSubQuery(): iterable
    {
        $all = range(1000, 1015);
        yield ['anonymous', []];
        yield ['accounting_verificator', []];
        yield ['bookingonly', $all];
        yield ['individual', $all];
        yield ['member', $all];
        yield ['trainer', $all];
        yield ['formationresponsible', $all];
        yield ['responsible', $all];
        yield ['administrator', $all];
    }

    public function testGetOneByLoginPassword(): void
    {
        self::assertNull($this->repository->getOneByLoginPassword('foo', 'bar'), 'wrong user');
        self::assertNull($this->repository->getOneByLoginPassword('administrator', 'bar'), 'wrong password');

        $user = $this->repository->getOneByLoginPassword('administrator', 'administrator');
        self::assertNotNull($user);
        self::assertSame(1000, $user->getId());

        $hash = $this->getEntityManager()->getConnection()->executeQuery('SELECT password FROM `user` WHERE id = 1000')->fetchOne();
        self::assertStringStartsWith('$', $hash, 'password should have been re-hashed automatically');
        self::assertNotSame(md5('administrator'), $hash, 'password should have been re-hashed automatically');
    }

    public function testGetOneByLogin(): void
    {
        self::assertNull($this->repository->getOneById(1), 'wrong user');

        $user = $this->repository->getOneById(1000);
        self::assertNotNull($user);
        self::assertSame(1000, $user->getId());
    }

    public function testGetAllAdministratorsToNotify(): void
    {
        $actual = $this->repository->getAllAdministratorsToNotify();
        self::assertCount(1, $actual);
    }

    public function testGetAllToQueueBalanceMessage(): void
    {
        $actual = $this->repository->getAllToQueueBalanceMessage();
        self::assertCount(2, $actual);

        $actualBookings = [];
        foreach ($actual[0]->getBookings() as $booking) {
            $actualBookings[] = $booking->getId();
        }

        $expected = [4004, 4005, 4015];
        self::assertSame($expected, $actualBookings, 'must have pre-loaded only the bookings that we are interested in');
    }

    public function testGetAllToQueueBalanceMessageNegative(): void
    {
        $actual = $this->repository->getAllToQueueBalanceMessage(true);
        self::assertCount(0, $actual);
    }

    #[DataProvider('providerGetOneByLoginOrEmail')]
    public function testGetOneByLoginOrEmail(?string $loginOrEmail, ?int $expected): void
    {
        $actual = $this->repository->getOneByLoginOrEmail($loginOrEmail);
        self::assertSame($expected, $actual ? $actual->getId() : $actual);
    }

    public static function providerGetOneByLoginOrEmail(): iterable
    {
        yield [null, null];
        yield ['', null];
        yield ['non-existing', null];
        yield ['member', 1002];
        yield ['member@example.com', 1002];
        yield ['son', 1008];
    }

    public function testRecordLogin(): void
    {
        $this->setCurrentUser('administrator');

        /** @var User $user */
        $user = $this->getEntityManager()->getReference(User::class, 1002);

        self::assertNull($user->getFirstLogin());
        self::assertNull($user->getLastLogin());
        $this->assertNoStamp($user);

        $user->recordLogin();
        _em()->flush();

        $firstLogin = $user->getFirstLogin();
        $lastLogin = $user->getLastLogin();
        self::assertNotNull($firstLogin);
        self::assertNotNull($lastLogin);
        $this->assertNoStamp($user);

        $user->recordLogin();
        _em()->flush();

        $firstLogin2 = $user->getFirstLogin();
        $lastLogin2 = $user->getLastLogin();
        self::assertSame($firstLogin, $firstLogin2);
        self::assertNotSame($lastLogin, $lastLogin2);
        self::assertNotNull($lastLogin2);
        $this->assertNoStamp($user);
    }

    private function assertNoStamp(User $user): void
    {
        $count = $this->getEntityManager()->getConnection()->fetchOne('SELECT COUNT(*) FROM user WHERE id = ' . $user->getId() . ' AND creation_date IS NULL AND creator_id IS NULL AND update_date IS NULL AND updater_id IS NULL');
        self::assertSame(1, $count);
    }

    public function testAllUserRelationsHaveTestCases(): void
    {
        $actual = self::providerDeletingUserMightDeleteCascadeRelation();
        $connection = $this->getEntityManager()->getConnection();
        $missingRelations = '';
        foreach ($connection->createSchemaManager()->listTables() as $table) {
            foreach ($table->getForeignKeys() as $foreignKey) {
                if ('user' === $foreignKey->getForeignTableName()) {
                    foreach ($foreignKey->getLocalColumns() as $column) {
                        $relation = [$table->getName(), $column, false];
                        if (!$this->exist($relation, $actual)) {
                            $missingRelations .= preg_replace('~\s+~', ' ', str_replace(["\n", ',]'], ['', ']'], ve($relation, true) . ',')) . PHP_EOL;
                        }
                    }
                }
            }
        }

        self::assertTrue('' === $missingRelations, 'some user relations are missing test cases, copy-paste the code bellow into providerDeletingUserMightDeleteCascadeRelation()' . PHP_EOL . PHP_EOL . $missingRelations);
    }

    private function exist(array $needle, iterable $stck): bool
    {
        foreach ($stck as $candidate) {
            if ($candidate[0] === $needle[0] && $candidate[1] === $needle[1]) {
                return true;
            }
        }

        return false;
    }

    #[DataProvider('providerDeletingUserMightDeleteCascadeRelation')]
    public function testDeletingUserMightDeleteCascadeRelation(string $table, string $field, bool $expectDeleted): void
    {
        $connection = $this->getEntityManager()->getConnection();

        if ($table === 'log') {
            $connection->insert('log', []);
        }

        $countBefore = $connection->fetchOne("SELECT COUNT(*) FROM `$table`");
        $expectCount = $countBefore - ($expectDeleted || $table === 'user' ? 1 : 0);

        // 1035 is a user that has no relation at all in tests fixture, so we can be sure that
        // we won't trigger unique constraints when updating, and we won't delete things via another
        // pre-existing field when deleting a specific field
        $connection->executeStatement("UPDATE `$table` SET `$field` = 1015 LIMIT 1");
        self::assertSame(1, $connection->fetchOne("SELECT COUNT(*) FROM `$table` WHERE `$field` = 1015"), "should have exactly 1 $table.$field with the user ");
        $connection->executeStatement('DELETE FROM user WHERE id = 1015');

        $countAfter = $connection->fetchOne("SELECT COUNT(*) FROM `$table`");

        self::assertSame($expectCount, $countAfter, $expectDeleted ? 'should cascade delete' : 'should not cascade delete');
    }

    public static function providerDeletingUserMightDeleteCascadeRelation(): iterable
    {
        return [
            ['transaction_line', 'creator_id', false],
            ['transaction_line', 'owner_id', false],
            ['transaction_line', 'updater_id', false],
            ['bookable', 'owner_id', false],
            ['bookable', 'creator_id', false],
            ['bookable', 'updater_id', false],
            ['account', 'owner_id', false],
            ['account', 'creator_id', false],
            ['account', 'updater_id', false],
            ['transaction_tag', 'owner_id', false],
            ['transaction_tag', 'updater_id', false],
            ['transaction_tag', 'creator_id', false],
            ['user_tag', 'owner_id', false],
            ['user_tag', 'updater_id', false],
            ['user_tag', 'creator_id', false],
            ['bookable_metadata', 'updater_id', false],
            ['bookable_metadata', 'creator_id', false],
            ['bookable_metadata', 'owner_id', false],
            ['license', 'owner_id', false],
            ['license', 'updater_id', false],
            ['license', 'creator_id', false],
            ['booking', 'owner_id', false],
            ['booking', 'updater_id', false],
            ['booking', 'creator_id', false],
            ['image', 'creator_id', false],
            ['image', 'owner_id', false],
            ['image', 'updater_id', false],
            ['accounting_document', 'creator_id', false],
            ['accounting_document', 'updater_id', false],
            ['accounting_document', 'owner_id', false],
            ['user', 'owner_id', false],
            ['user', 'updater_id', false],
            ['user', 'creator_id', false],
            ['log', 'creator_id', true], // delete all my logs, which should not be a huge quantity of data, but still worth it
            ['log', 'owner_id', true], // idem
            ['log', 'updater_id', false],
            ['user_tag_user', 'user_id', true], // non-existing user cannot be tagged
            ['expense_claim', 'reviewer_id', false],
            ['expense_claim', 'owner_id', false],
            ['expense_claim', 'creator_id', false],
            ['expense_claim', 'updater_id', false],
            ['country', 'creator_id', false],
            ['country', 'owner_id', false],
            ['country', 'updater_id', false],
            ['configuration', 'creator_id', false],
            ['configuration', 'owner_id', false],
            ['configuration', 'updater_id', false],
            ['license_user', 'user_id', true], // non-existing user cannot have a license
            ['bookable_tag', 'owner_id', false],
            ['bookable_tag', 'updater_id', false],
            ['bookable_tag', 'creator_id', false],
            ['transaction', 'owner_id', false],
            ['transaction', 'creator_id', false],
            ['transaction', 'updater_id', false],
            ['message', 'creator_id', false],
            ['message', 'recipient_id', true], // a message that lost its recipient cannot have any purpose, so delete it
            ['message', 'owner_id', true], // owner is semantically exactly the same as recipient
            ['message', 'updater_id', false],
        ];
    }
}
