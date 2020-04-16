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
use Laminas\View\Renderer\RendererInterface;
use Money\Money;

class MessageQueuerTest extends \PHPUnit\Framework\TestCase
{
    private function createMockMessageQueuer(): MessageQueuer
    {
        global $container;

        $entityManager = $container->get(EntityManager::class);
        $renderer = $container->get(RendererInterface::class);

        $messageQueuer = new MessageQueuer(
            $entityManager,
            $renderer,
            'my-ichtus.lan'
        );

        return $messageQueuer;
    }

    public function testQueueRegister(): void
    {
        $user = $this->createMockUserMinimal();
        $messageQueuer = $this->createMockMessageQueuer();
        $message = $messageQueuer->queueRegister($user);

        $this->assertMessage($message, $user, 'minimal@example.com', MessageTypeType::REGISTER, 'Demande de création de compte au Club Nautique Ichtus');
    }

    public function testQueueUnregister(): void
    {
        $unregisteredUser = $this->createMockUser();
        $admin = $this->createMockUserAdmin();
        $messageQueuer = $this->createMockMessageQueuer();
        $message = $messageQueuer->queueUnregister($admin, $unregisteredUser);

        $this->assertMessage($message, $admin, 'administrator@example.com', MessageTypeType::UNREGISTER, 'Démission');
    }

    public function testQueueResetPassword(): void
    {
        $user = $this->createMockUser();
        $messageQueuer = $this->createMockMessageQueuer();
        $message = $messageQueuer->queueResetPassword($user, 'householder@example.com');

        $this->assertMessage($message, $user, 'householder@example.com', MessageTypeType::RESET_PASSWORD, 'Demande de modification de mot de passe');
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

        $messageQueuer = $this->createMockMessageQueuer();
        $message = $messageQueuer->queueBalance($user, $bookables);

        $this->assertMessage($message, $user, 'john.doe@example.com', MessageTypeType::BALANCE, 'Balance de compte', $variant);
    }

    public function testQueueAllBalance(): void
    {
        $messageQueuer = $this->createMockMessageQueuer();
        $actual = $messageQueuer->queueAllBalance();

        self::assertsame(1, $actual);
    }

    public function testQueueNegativeBalance(): void
    {
        $messageQueuer = $this->createMockMessageQueuer();
        $actual = $messageQueuer->queueNegativeBalance();

        self::assertsame(0, $actual);
    }

    private function createMockUser(): User
    {
        $user = $this->createMock(User::class);

        $user->expects($this->any())
            ->method('getId')
            ->willReturn(123);

        $user->expects($this->any())
            ->method('getLogin')
            ->willReturn('john.doe');

        $user->expects($this->any())
            ->method('getFirstName')
            ->willReturn('John');

        $user->expects($this->any())
            ->method('getLastName')
            ->willReturn('Doe');

        $user->expects($this->any())
            ->method('getName')
            ->willReturn('John Doe');

        $user->expects($this->any())
            ->method('getEmail')
            ->willReturn('john.doe@example.com');

        $user->expects($this->any())
            ->method('createToken')
            ->willReturn(str_repeat('X', 32));

        return $user;
    }

    private function createMockUserAdmin(): User
    {
        $user = $this->createMock(User::class);
        $user->expects($this->any())
            ->method('getLogin')
            ->willReturn('admin');

        $user->expects($this->any())
            ->method('getFirstName')
            ->willReturn('Admin');

        $user->expects($this->any())
            ->method('getLastName')
            ->willReturn('Istrator');

        $user->expects($this->any())
            ->method('getEmail')
            ->willReturn('administrator@example.com');

        return $user;
    }

    private function createMockUserMinimal(): User
    {
        $user = $this->createMock(User::class);
        $user->expects($this->any())
            ->method('getEmail')
            ->willReturn('minimal@example.com');

        $user->expects($this->any())
            ->method('createToken')
            ->willReturn(str_repeat('X', 32));

        return $user;
    }

    private function assertMessage(Message $message, ?User $user, string $email, string $type, string $subject, ?string $variant = null): void
    {
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
     * Custom assert that will not produce gigantic diff
     *
     * @param string $file
     * @param string $actual
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
