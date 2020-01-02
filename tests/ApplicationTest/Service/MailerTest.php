<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Model\Message;
use Application\Service\Mailer;
use Doctrine\ORM\EntityManager;
use Laminas\Mail\Transport\InMemory;

class MailerTest extends \PHPUnit\Framework\TestCase
{
    private function createMockMailer(): Mailer
    {
        $entityManager = $this->createMock(EntityManager::class);
        $transport = new InMemory();

        $mailer = new Mailer(
            $entityManager,
            $transport,
            null,
            'noreply@example.com',
            '/user/bin/php'
        );

        return $mailer;
    }

    public function testSendMessage(): void
    {
        $mailer = $this->createMockMailer();
        $message = new Message();
        $message->setEmail('john.doe@example.com');

        $this->expectOutputRegex('~email sent to: john\.doe@example\.com~');
        $mailer->sendMessage($message);
        self::assertNotNull($message->getDateSent());
    }
}
