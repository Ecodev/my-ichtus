<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\DBAL\Types\MessageTypeType;
use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Message;
use Application\Model\User;
use Application\Service\MessageQueuer;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Service\MessageRenderer;
use Laminas\View\Renderer\RendererInterface;
use Money\Money;

class MessageQueuerTest extends \PHPUnit\Framework\TestCase
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

    /**
     * @dataProvider userProvider
     */
    public function testQueueResetPassword(User $user, ?string $expectedEmail): void
    {
        $messageQueuer = $this->createMessageQueuer();
        $message = $messageQueuer->queueResetPassword($user);

        $this->assertMessage($message, $user, $expectedEmail, MessageTypeType::RESET_PASSWORD, 'Demande de modification de mot de passe');
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

    public function userProvider(): array
    {
        $userWithEmail = $this->createMockUser();
        $userWithFamilyOwner = $this->createMockUserWithFamilyOwner(true);
        $userWithFamilyOwnerWithoutEmail = $this->createMockUserWithFamilyOwner(false);
        $userWithoutEmail = $this->createMockUserWithoutEmail();

        return [
            'user with email' => [$userWithEmail, 'john.doe@example.com'],
            'user without email' => [$userWithoutEmail, null],
            'user without email but with family owner with email' => [$userWithFamilyOwner, 'family-owner@example.com'],
            'user without email but with family owner without email' => [$userWithFamilyOwnerWithoutEmail, null],
        ];
    }

    private function createMockUser(?User $owner = null): User
    {
        $user = $this->createMock(User::class);

        $user->expects(self::any())
            ->method('getId')
            ->willReturn(123);

        $user->expects(self::any())
            ->method('getLogin')
            ->willReturn('john.doe');

        $user->expects(self::any())
            ->method('getFirstName')
            ->willReturn('John');

        $user->expects(self::any())
            ->method('getLastName')
            ->willReturn('Doe');

        $user->expects(self::any())
            ->method('getName')
            ->willReturn('John Doe');

        $user->expects(self::any())
            ->method('getEmail')
            ->willReturn($owner ? null : 'john.doe@example.com');

        $user->expects(self::any())
            ->method('createToken')
            ->willReturn(str_repeat('X', 32));

        $user->expects(self::any())
            ->method('getOwner')
            ->willReturn($owner);

        return $user;
    }

    private function createMockUserWithFamilyOwner(bool $hasEmail): User
    {
        $owner = $this->createMock(User::class);

        $owner->expects(self::any())
            ->method('getFirstName')
            ->willReturn('Family');

        $owner->expects(self::any())
            ->method('getLastName')
            ->willReturn('Owner');

        $owner->expects(self::any())
            ->method('getName')
            ->willReturn('Family Owner');

        $owner->expects(self::any())
            ->method('getEmail')
            ->willReturn($hasEmail ? 'family-owner@example.com' : null);

        $user = $this->createMockUser($owner);

        return $user;
    }

    private function createMockUserAdmin(): User
    {
        $user = $this->createMock(User::class);
        $user->expects(self::any())
            ->method('getLogin')
            ->willReturn('admin');

        $user->expects(self::any())
            ->method('getFirstName')
            ->willReturn('Admin');

        $user->expects(self::any())
            ->method('getLastName')
            ->willReturn('Istrator');

        $user->expects(self::any())
            ->method('getEmail')
            ->willReturn('administrator@example.com');

        return $user;
    }

    private function createMockUserMinimal(): User
    {
        $user = $this->createMock(User::class);
        $user->expects(self::any())
            ->method('getEmail')
            ->willReturn('minimal@example.com');

        $user->expects(self::any())
            ->method('createToken')
            ->willReturn(str_repeat('X', 32));

        return $user;
    }

    private function createMockUserWithoutEmail(): User
    {
        $user = $this->createMock(User::class);

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
        @mkdir($dir, 0777, true);
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
