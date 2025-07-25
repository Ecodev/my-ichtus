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
 * Service to queue new message for pre-defined purposes.
 */
class MessageQueuer
{
    private bool $toFamilyOwner = false;

    private readonly UserRepository $userRepository;

    public function __construct(
        private readonly EntityManager $entityManager,
        private readonly MessageRenderer $messageRenderer,
    ) {
        $this->userRepository = $this->entityManager->getRepository(User::class);
    }

    public function queueRegister(User $user): ?Message
    {
        $subject = 'Demande de création de compte au Club Nautique Ichtus';
        $mailParams = [
            'token' => $user->createToken(),
        ];

        $message = $this->createMessage($user, $subject, MessageTypeType::REGISTER, $mailParams);

        return $message;
    }

    public function queueUnregister(User $admin, User $unregisteredUser): ?Message
    {
        $subject = 'Démission';
        $mailParams = [
            'unregisteredUser' => $unregisteredUser,
        ];

        $message = $this->createMessage($admin, $subject, MessageTypeType::UNREGISTER, $mailParams);

        return $message;
    }

    /**
     * Queue a reset password email to specified user.
     *
     * @param User $user The user for which a password reset will be done
     */
    public function queueResetPassword(User $user): ?Message
    {
        $subject = 'Demande de modification de mot de passe';
        $mailParams = [
            'token' => $user->createToken(),
        ];

        $message = $this->createMessage($user, $subject, MessageTypeType::RESET_PASSWORD, $mailParams);

        return $message;
    }

    /**
     * @param Bookable[] $bookables
     */
    public function queueBalance(User $user, iterable $bookables): ?Message
    {
        $subject = 'Balance de compte';
        $mailParams = [
            'bookables' => $bookables,
        ];

        $message = $this->createMessage($user, $subject, MessageTypeType::BALANCE, $mailParams);

        return $message;
    }

    public function queueLeaveFamily(User $user): ?Message
    {
        $subject = 'Ménage quitté';
        $mailParams = [];

        $message = $this->createMessage($user, $subject, MessageTypeType::LEAVE_FAMILY, $mailParams);

        return $message;
    }

    public function queueAdminLeaveFamily(User $independentUser): ?Message
    {
        $subject = 'Ménage quitté';
        $mailParams = ['independentUser' => $independentUser];

        $message = $this->createMessage(null, $subject, MessageTypeType::ADMIN_LEAVE_FAMILY, $mailParams, 'caissier@ichtus.ch');

        return $message;
    }

    /**
     * Create a message by rendering the template.
     */
    private function createMessage(?User $user, string $subject, string $type, array $mailParams, ?string $email = null): ?Message
    {
        $email = $this->getEmail($user, $email);
        if (!$email) {
            return null;
        }

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
     */
    private function queueBalanceForEachUsers(array $users): int
    {
        foreach ($users as $user) {
            $bookables = $user->getRunningBookings()->map(fn (Booking $booking) => $booking->getBookable());

            $this->queueBalance($user, $bookables);
        }

        return count($users);
    }

    public function queueAllBalance(): int
    {
        $users = $this->userRepository->getAllToQueueBalanceMessage();

        return $this->queueBalanceForEachUsers($users);
    }

    public function queueNegativeBalance(): int
    {
        /** @var UserRepository $userRepository */
        $userRepository = $this->entityManager->getRepository(User::class);
        $users = $userRepository->getAllToQueueBalanceMessage(true);

        return $this->queueBalanceForEachUsers($users);
    }

    private function getEmail(?User $user, ?string $email): ?string
    {
        $this->toFamilyOwner = false;
        $email ??= $user?->getEmail();

        // Fallback to family owner if any
        if (!$email && $user?->getOwner()) {
            $email = $this->userRepository->getAclFilter()->runWithoutAcl(fn () => $user->getOwner()->getEmail());

            $this->toFamilyOwner = true;
        }

        return $email;
    }

    /**
     * Whether the last sent email was sent to family owner instead of original recipient.
     */
    public function wasToFamilyOwner(): bool
    {
        return $this->toFamilyOwner;
    }
}
