<?php

declare(strict_types=1);

namespace Application\Service;

use Application\DBAL\Types\MessageTypeType;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\Message;
use Application\Model\User;
use Application\Repository\UserRepository;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Service\MessageRenderer;

/**
 * Service to queue new message for pre-defined purposes
 */
class MessageQueuer
{
    private EntityManager $entityManager;

    private MessageRenderer $messageRenderer;

    public function __construct(EntityManager $entityManager, MessageRenderer $messageRenderer)
    {
        $this->entityManager = $entityManager;
        $this->messageRenderer = $messageRenderer;
    }

    public function queueRegister(User $user): Message
    {
        $subject = 'Demande de création de compte au Club Nautique Ichtus';
        $mailParams = [
            'token' => $user->createToken(),
        ];

        $message = $this->createMessage($user, $user->getEmail(), $subject, MessageTypeType::REGISTER, $mailParams);

        return $message;
    }

    public function queueUnregister(User $admin, User $unregisteredUser): Message
    {
        $subject = 'Démission';
        $mailParams = [
            'unregisteredUser' => $unregisteredUser,
        ];

        $message = $this->createMessage($admin, $admin->getEmail(), $subject, MessageTypeType::UNREGISTER, $mailParams);

        return $message;
    }

    /**
     * Queue a reset password email to specified user
     *
     * @param User $user The user for which a password reset will be done
     * @param string $email the address to send the email to. Might be different than the user's email
     *
     * @return Message
     */
    public function queueResetPassword(User $user, string $email): Message
    {
        $subject = 'Demande de modification de mot de passe';
        $mailParams = [
            'token' => $user->createToken(),
        ];

        $message = $this->createMessage($user, $email, $subject, MessageTypeType::RESET_PASSWORD, $mailParams);

        return $message;
    }

    /**
     * @param User $user
     * @param Bookable[] $bookables
     *
     * @return Message
     */
    public function queueBalance(User $user, iterable $bookables): Message
    {
        $subject = 'Balance de compte';
        $mailParams = [
            'bookables' => $bookables,
        ];

        $message = $this->createMessage($user, $user->getEmail(), $subject, MessageTypeType::BALANCE, $mailParams);

        return $message;
    }

    /**
     * Create a message by rendering the template
     *
     * @param null|User $user
     * @param string $email
     * @param string $subject
     * @param string $type
     * @param array $mailParams
     *
     * @return Message
     */
    private function createMessage(?User $user, string $email, string $subject, string $type, array $mailParams): Message
    {
        $content = $this->messageRenderer->render($user, $email, $subject, $type, $mailParams);

        $message = new Message();
        $message->setType($type);
        $message->setRecipient($user);
        $message->setSubject($subject);
        $message->setBody($content);
        $message->setEmail($email);
        $this->entityManager->persist($message);

        return $message;
    }

    /**
     * @param User[] $users
     *
     * @return int
     */
    private function queueBalanceForEachUsers(array $users): int
    {
        foreach ($users as $user) {
            $bookables = $user->getBookings()->map(function (Booking $booking) {
                return $booking->getBookable();
            });

            $this->queueBalance($user, $bookables);
        }

        return count($users);
    }

    public function queueAllBalance(): int
    {
        /** @var UserRepository $userRepository */
        $userRepository = $this->entityManager->getRepository(User::class);
        $users = $userRepository->getAllToQueueBalanceMessage();

        return $this->queueBalanceForEachUsers($users);
    }

    public function queueNegativeBalance(): int
    {
        /** @var UserRepository $userRepository */
        $userRepository = $this->entityManager->getRepository(User::class);
        $users = $userRepository->getAllToQueueBalanceMessage(true);

        return $this->queueBalanceForEachUsers($users);
    }
}
