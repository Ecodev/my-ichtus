<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\DBAL\Types\MessageTypeType;
use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Message;
use Application\Model\User;
use Application\Service\MessageQueuer;
use Closure;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Service\MessageRenderer;
use Laminas\View\Renderer\RendererInterface;
use Money\Money;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class MessageQueuerTest extends TestCase
{
    private function createMessageQueuer(): MessageQueuer
    {
        global $container;

        $entityManager = $container->get(EntityManager::class);
        $viewRenderer = $container->get(RendererInterface::class);
        $messageRenderer = new MessageRenderer($viewRenderer, 'my-ichtus.lan');

        $messageQueuer = new MessageQueuer(
            $entityManager,
            $messageRenderer,
        );

        return $messageQueuer;
    }

    public function testQueueRegister(): void
    {
        $user = $this->createMockUserMinimal();
        $messageQueuer = $this->createMessageQueuer();
        $message = $messageQueuer->queueRegister($user);

        $this->assertMessage($message, $user, 'minimal@example.com', MessageTypeType::REGISTER, 'Demande de création de compte au Club Nautique Ichtus');
    }

    public function testQueueUnregister(): void
    {
        $unregisteredUser = $this->createMockUser();
        $admin = $this->createMockUserAdmin();
        $messageQueuer = $this->createMessageQueuer();
        $message = $messageQueuer->queueUnregister($admin, $unregisteredUser);

        $this->assertMessage($message, $admin, 'administrator@example.com', MessageTypeType::UNREGISTER, 'Démission');
    }

    #[DataProvider('providerQueueResetPassword')]
    public function testQueueResetPassword(Closure $userGetter, ?string $expectedEmail): void
    {
        $user = Closure::bind($userGetter, $this)();
        $messageQueuer = $this->createMessageQueuer();
        $message = $messageQueuer->queueResetPassword($user);

        $this->assertMessage($message, $user, $expectedEmail, MessageTypeType::RESET_PASSWORD, 'Demande de modification de mot de passe');
    }

    public static function providerQueueResetPassword(): iterable
    {
        $userWithEmail = fn () => $this->createMockUser();
        $userWithFamilyOwner = fn () => $this->createMockUserWithFamilyOwner(true);
        $userWithFamilyOwnerWithoutEmail = fn () => $this->createMockUserWithFamilyOwner(false);
        $userWithoutEmail = fn () => $this->createMockUserWithoutEmail();

        return [
            'user with email' => [$userWithEmail, 'john.doe@example.com'],
            'user without email' => [$userWithoutEmail, null],
            'user without email but with family owner with email' => [$userWithFamilyOwner, 'family-owner@example.com'],
            'user without email but with family owner without email' => [$userWithFamilyOwnerWithoutEmail, null],
        ];
    }

    public function testQueueBalancePositive(): void
    {
        $bookables = [];
        $bookables[] = $this->createBookable('Cotisation', Money::CHF(9000));
        $bookables[] = $this->createBookable('Fonds de réparation interne', Money::CHF(1000));

        $this->queueBalance($bookables, 'positive');
    }

    public function testQueueBalanceNegative(): void
    {
        $bookables = [];
        $bookables[] = $this->createBookable('Cotisation', Money::CHF(9000));
        $bookables[] = $this->createBookable('Fonds de réparation interne', Money::CHF(1000));
        $bookables[] = $this->createBookable('Casier 1012', Money::CHF(2000));
        $bookables[] = $this->createBookable('Casier 1014', Money::CHF(2000));

        $this->queueBalance($bookables, 'negative');
    }

    private function queueBalance(array $bookables, string $variant): void
    {
        $user = new User();
        $user->setLogin('john.doe');
        $user->setFirstName('John');
        $user->setLastName('Doe');
        $user->setEmail('john.doe@example.com');

        $account = new Account();
        $account->setBalance(Money::CHF($variant === 'positive' ? 2500 : -4500));
        $account->setOwner($user);

        $messageQueuer = $this->createMessageQueuer();
        $message = $messageQueuer->queueBalance($user, $bookables);

        $this->assertMessage($message, $user, 'john.doe@example.com', MessageTypeType::BALANCE, 'Balance de compte', $variant);
    }

    public function testQueueAllBalance(): void
    {
        $messageQueuer = $this->createMessageQueuer();
        $actual = $messageQueuer->queueAllBalance();

        self::assertsame(2, $actual);
    }

    public function testQueueNegativeBalance(): void
    {
        $messageQueuer = $this->createMessageQueuer();
        $actual = $messageQueuer->queueNegativeBalance();

        self::assertsame(0, $actual);
    }

    public function testQueueLeaveFamily(): void
    {
        $messageQueuer = $this->createMessageQueuer();
        $user = $this->createMockUser();
        $message = $messageQueuer->queueLeaveFamily($user);

        $this->assertMessage($message, $user, 'john.doe@example.com', MessageTypeType::LEAVE_FAMILY, 'Ménage quitté');
    }

    public function testQueueAdminLeaveFamily(): void
    {
        $messageQueuer = $this->createMessageQueuer();
        $user = $this->createMockUser();
        $message = $messageQueuer->queueAdminLeaveFamily($user);

        $this->assertMessage($message, null, 'caissier@ichtus.ch', MessageTypeType::ADMIN_LEAVE_FAMILY, 'Ménage quitté');
    }

    public function testQueueRequestUserDeletion(): void
    {
        $userToDelete = $this->createMockUserWithFamilyOwner(true, true);
        $requestingUser = $userToDelete->getOwner();
        $messageQueuer = $this->createMessageQueuer();

        $message = $messageQueuer->queueRequestUserDeletion($requestingUser, $userToDelete);

        $this->assertMessage($message, null, 'caissier@ichtus.ch', MessageTypeType::REQUEST_USER_DELETION, 'Demande de suppression de compte');
    }

    private function createMockUser(?User $owner = null, bool $withEmail = true): User
    {
        $user = self::createStub(User::class);

        $user->method('getId')->willReturn(123);
        $user->method('getLogin')->willReturn('john.doe');
        $user->method('getFirstName')->willReturn('John');
        $user->method('getLastName')->willReturn('Doe');
        $user->method('getName')->willReturn('John Doe');
        $user->method('getEmail')->willReturn($withEmail ? 'john.doe@example.com' : null);
        $user->method('createToken')->willReturn(str_repeat('X', 32));
        $user->method('getOwner')->willReturn($owner);

        return $user;
    }

    private function createMockUserWithFamilyOwner(bool $hasEmail, bool $ownerHasEmail = false): User
    {
        $owner = self::createStub(User::class);

        $owner->method('getFirstName')->willReturn('Family');
        $owner->method('getLastName')->willReturn('Owner');
        $owner->method('getName')->willReturn('Family Owner');
        $owner->method('getEmail')->willReturn($hasEmail ? 'family-owner@example.com' : null);

        $user = $this->createMockUser($owner, $ownerHasEmail);

        return $user;
    }

    private function createMockUserAdmin(): User
    {
        $user = self::createStub(User::class);
        $user->method('getLogin')->willReturn('admin');
        $user->method('getFirstName')->willReturn('Admin');
        $user->method('getLastName')->willReturn('Istrator');
        $user->method('getEmail')->willReturn('administrator@example.com');

        return $user;
    }

    private function createMockUserMinimal(): User
    {
        $user = self::createStub(User::class);
        $user->method('getEmail')->willReturn('minimal@example.com');
        $user->method('createToken')->willReturn(str_repeat('X', 32));

        return $user;
    }

    private function createMockUserWithoutEmail(): User
    {
        $user = self::createStub(User::class);

        return $user;
    }

    private function assertMessage(?Message $message, ?User $user, ?string $email, string $type, string $subject, ?string $variant = null): void
    {
        if (!$email) {
            self::assertNull($message);

            return;
        }

        self::assertSame($type, $message->getType());
        self::assertSame($email, $message->getEmail());
        self::assertSame($user, $message->getRecipient());
        self::assertNull($message->getDateSent());
        self::assertSame($subject, $message->getSubject());

        $variant = $variant ? '-' . $variant : $variant;
        $expectedBody = 'tests/data/emails/' . str_replace('_', '-', $type . $variant) . '.html';
        $this->assertFile($expectedBody, $message->getBody());
    }

    /**
     * Custom assert that will not produce gigantic diff.
     */
    private function assertFile(string $file, string $actual): void
    {
        // Log actual result for easier comparison with external diff tools
        $logFile = 'logs/' . $file;
        $dir = dirname($logFile);
        @mkdir($dir, 0o777, true);
        file_put_contents($logFile, $actual);

        self::assertFileExists($file, 'Expected file must exist on disk, fix it with: cp ' . $logFile . ' ' . $file);
        $expected = file_get_contents($file);

        self::assertTrue($expected === $actual, 'File content does not match, compare with: meld ' . $file . ' ' . $logFile);
    }

    private function createBookable(string $bookableName, Money $periodicPrice): Bookable
    {
        $bookable = new Bookable();
        $bookable->setName($bookableName);
        $bookable->setPeriodicPrice($periodicPrice);

        return $bookable;
    }
}
