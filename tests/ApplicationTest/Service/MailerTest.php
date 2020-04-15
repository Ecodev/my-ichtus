<?php

declare(strict_types=1);

namespace ApplicationTest\Service;

use Application\Model\Message;
use Application\Service\Mailer;
use Doctrine\ORM\EntityManager;
use Laminas\Mail;
use Laminas\Mail\Address;
use Laminas\Mail\Transport\TransportInterface;

class MailerTest extends \PHPUnit\Framework\TestCase
{
    private function createMockMailer(): Mailer
    {
        /** @var EntityManager $entityManager */
        $entityManager = $this->createMock(EntityManager::class);
        $transport = $this->createMockTransport();

        $mailer = new Mailer(
            $entityManager,
            $transport,
            null,
            'noreply@example.com',
            '/user/bin/php'
        );

        return $mailer;
    }

    private function createMockTransport(): TransportInterface
    {
        return new class() implements TransportInterface {
            public function send(Mail\Message $message): void
            {
                // Purposefully place current cursor at the end of list
                foreach ($message->getFrom() as $a) {
                    $a->getEmail();
                }

                foreach ($message->getTo() as $a) {
                    $a->getEmail();
                }
            }
        };
    }

    public function testMockTransportHasCursorAtEndOfList(): void
    {
        $message = new Mail\Message();
        $message->setFrom('alice@exampl.com');
        $message->setTo('bob@exampl.com');

        // New message has current cursor on first element
        self::assertInstanceOf(Address::class, $message->getFrom()->current());
        self::assertInstanceOf(Address::class, $message->getTo()->current());

        $transport = $this->createMockTransport();
        $transport->send($message);

        // After transport, message has current cursor on end of list
        self::assertFalse($message->getFrom()->current());
        self::assertFalse($message->getTo()->current());
    }

    public function testSendMessage(): void
    {
        $mailer = $this->createMockMailer();
        $message = new Message();
        $message->setEmail('john.doe@example.com');

        $this->expectOutputRegex('~email from noreply@example\.com sent to: john\.doe@example\.com~');
        $mailer->sendMessage($message);
        self::assertNotNull($message->getDateSent());
    }
}
